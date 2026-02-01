import { test, expect } from '@playwright/test';

/**
 * NileLink E2E: Customer -> POS Flow
 * 
 * Flow:
 * 1. Customer visits Shop and adds items
 * 2. Customer completes Checkout (Checkout is mocked or assumes dev wallet)
 * 3. POS displays the new order automatically (due to our auto-refresh fix)
 */

test.describe('NileLink Ecosystem E2E', () => {

    const CUSTOMER_URL = 'http://localhost:3000';
    const POS_URL = 'http://localhost:3001';

    test('should complete a full order flow from Customer to POS', async ({ page, context }) => {
        // 1. Visit Customer Shop
        await page.goto(`${CUSTOMER_URL}/shop`);
        await expect(page).toHaveTitle(/Shop/i);

        // 2. Add first available item to cart
        // Using skeleton aware selector or first card
        const addToCartBtn = page.locator('button:has-text("Add to")').first();
        await addToCartBtn.click();

        // 3. Go to Checkout
        await page.goto(`${CUSTOMER_URL}/checkout`);
        await expect(page.locator('h1')).toContainText('Checkout');

        // 4. Submit Order
        // Assuming address and payment are defaulted or filled
        await page.fill('textarea[placeholder*="address"]', '123 Test Street, NileLink City');

        const placeOrderBtn = page.getByRole('button', { name: /Place Order/i });
        await placeOrderBtn.click();

        // 5. Verify Confirmation
        await expect(page.locator('h1')).toContainText('Order Confirmed', { timeout: 15000 });
        const orderId = await page.locator('span.text-blue-400').innerText();
        const cleanOrderId = orderId.replace('#', '').trim();
        console.log(`Order placed successfully: ${cleanOrderId}`);

        // 6. Open a new tab/page for the POS
        const posPage = await context.newPage();
        await posPage.goto(`${POS_URL}/orders`);

        // 7. Verify Order appears in POS
        // Since we added auto-refresh (15s), we wait for it to appear
        const posOrderItems = posPage.locator(`text=${cleanOrderId.substring(0, 6)}`);
        await expect(posOrderItems).toBeVisible({ timeout: 20000 });

        console.log('E2E Flow Verified: Order visible in POS.');
    });

});
