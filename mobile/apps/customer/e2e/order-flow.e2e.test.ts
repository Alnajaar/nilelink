import { device, element, by, waitFor } from 'detox';
import { CustomerDatabase } from '../src/services/database';
import { syncSaga } from '@nilelink/mobile-sync-engine';

describe('Customer App Order Flow E2E', () => {
  let db: CustomerDatabase;

  beforeAll(async () => {
    await device.launchApp();
    db = await CustomerDatabase.open();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await db.clearDatabase();
  });

  describe('Restaurant Discovery', () => {
    it('should display restaurant list', async () => {
      await expect(element(by.id('restaurant-list'))).toBeVisible();
      await expect(element(by.text('Bella Italia'))).toBeVisible();
    });

    it('should search restaurants', async () => {
      await element(by.id('search-input')).typeText('Italian');
      await element(by.id('search-input')).tapReturnKey();

      await waitFor(element(by.text('Bella Italia')))
        .toBeVisible()
        .withTimeout(5000);

      // Should not show non-matching restaurants
      await expect(element(by.text('Burger Palace'))).not.toBeVisible();
    });

    it('should filter by cuisine', async () => {
      await element(by.id('cuisine-filter-Italian')).tap();

      await waitFor(element(by.text('Bella Italia')))
        .toBeVisible()
        .withTimeout(3000);

      await waitFor(element(by.text('Italian • Pizza')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Menu Browsing', () => {
    beforeEach(async () => {
      // Navigate to restaurant
      await element(by.text('Bella Italia')).tap();
    });

    it('should display restaurant menu', async () => {
      await expect(element(by.id('menu-screen'))).toBeVisible();
      await expect(element(by.text('Margherita Pizza'))).toBeVisible();
    });

    it('should add item to cart', async () => {
      await element(by.id('menu-item-Margherita')).tap();

      // Should show customization modal
      await expect(element(by.id('customization-modal'))).toBeVisible();

      // Add to cart
      await element(by.id('add-to-cart-btn')).tap();

      // Should show cart badge with count
      await expect(element(by.id('cart-badge'))).toBeVisible();
      await expect(element(by.id('cart-count'))).toHaveText('1');
    });

    it('should handle item customizations', async () => {
      await element(by.id('menu-item-Custom-Pizza')).tap();

      // Select customizations
      await element(by.id('topping-extra-cheese')).tap();
      await element(by.id('size-large')).tap();

      await element(by.id('add-to-cart-btn')).tap();

      // Verify customizations saved
      await element(by.id('cart-icon')).tap();
      await expect(element(by.text('Extra Cheese'))).toBeVisible();
      await expect(element(by.text('Large'))).toBeVisible();
    });
  });

  describe('Cart Management', () => {
    it('should display cart contents', async () => {
      await element(by.id('cart-icon')).tap();

      await expect(element(by.id('cart-screen'))).toBeVisible();
      await expect(element(by.text('Margherita Pizza'))).toBeVisible();
      await expect(element(by.id('cart-total'))).toBeVisible();
    });

    it('should update item quantity', async () => {
      // Increase quantity
      await element(by.id('quantity-plus')).tap();
      await expect(element(by.id('quantity-value'))).toHaveText('2');

      // Decrease quantity
      await element(by.id('quantity-minus')).tap();
      await expect(element(by.id('quantity-value'))).toHaveText('1');
    });

    it('should remove item from cart', async () => {
      await element(by.id('remove-item')).tap();
      await expect(element(by.text('Margherita Pizza'))).not.toBeVisible();
      await expect(element(by.id('empty-cart-message'))).toBeVisible();
    });
  });

  describe('Checkout Process', () => {
    beforeEach(async () => {
      // Add items to cart first
      await element(by.text('Bella Italia')).tap();
      await element(by.id('menu-item-Margherita')).tap();
      await element(by.id('add-to-cart-btn')).tap();
      await element(by.id('cart-icon')).tap();
    });

    it('should navigate to checkout', async () => {
      await element(by.id('checkout-btn')).tap();
      await expect(element(by.id('checkout-screen'))).toBeVisible();
    });

    it('should validate minimum order', async () => {
      // If order below minimum, should show warning
      await waitFor(element(by.id('minimum-order-warning')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should apply promo code', async () => {
      await element(by.id('promo-code-input')).typeText('WELCOME20');
      await element(by.id('apply-promo-btn')).tap();

      await waitFor(element(by.text('20% off your first order')))
        .toBeVisible()
        .withTimeout(3000);

      // Total should be updated
      await expect(element(by.id('checkout-total'))).toBeVisible();
    });

    it('should select delivery address', async () => {
      await element(by.id('address-selector')).tap();
      await element(by.text('123 Main Street')).tap();

      await expect(element(by.text('123 Main Street'))).toBeVisible();
    });

    it('should select payment method', async () => {
      await element(by.id('payment-method-selector')).tap();
      await element(by.text('NileLink Wallet')).tap();

      await expect(element(by.text('NileLink Wallet'))).toBeVisible();
    });

    it('should place order successfully', async () => {
      await element(by.id('place-order-btn')).tap();

      // Should show loading state
      await expect(element(by.id('placing-order-loader'))).toBeVisible();

      // Should navigate to order confirmation
      await waitFor(element(by.id('order-confirmation-screen')))
        .toBeVisible()
        .withTimeout(10000); // Allow time for backend processing

      await expect(element(by.text('Order Placed!'))).toBeVisible();
    });
  });

  describe('Order Tracking', () => {
    it('should display order status', async () => {
      // Navigate to orders
      await element(by.id('orders-tab')).tap();
      await expect(element(by.id('orders-screen'))).toBeVisible();

      // Should show recent order
      await expect(element(by.id('order-item-0'))).toBeVisible();
      await expect(element(by.text('Confirmed'))).toBeVisible();
    });

    it('should update order status in real-time', async () => {
      // Start order tracking
      await element(by.id('order-item-0')).tap();

      // Initially confirmed
      await expect(element(by.text('Confirmed'))).toBeVisible();

      // Simulate status change (would come via WebSocket in real app)
      // In test, we verify the UI can display different states
      await expect(element(by.id('order-timeline'))).toBeVisible();
    });
  });

  describe('Offline Functionality', () => {
    it('should work offline for browsing', async () => {
      // Disable network
      await device.setNetworkConnection('none');

      // Should still show cached restaurants
      await expect(element(by.text('Bella Italia'))).toBeVisible();

      // Re-enable network
      await device.setNetworkConnection('wifi');
    });

    it('should queue orders when offline', async () => {
      await device.setNetworkConnection('none');

      // Complete checkout flow
      await element(by.text('Bella Italia')).tap();
      await element(by.id('menu-item-Margherita')).tap();
      await element(by.id('add-to-cart-btn')).tap();
      await element(by.id('cart-icon')).tap();
      await element(by.id('checkout-btn')).tap();
      await element(by.id('place-order-btn')).tap();

      // Should show offline message
      await expect(element(by.text('Order will sync when online'))).toBeVisible();

      // Re-enable network and check sync
      await device.setNetworkConnection('wifi');

      // Should show sync indicator
      await waitFor(element(by.id('sync-indicator')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Sync Engine Integration', () => {
    it('should show sync status', async () => {
      await expect(element(by.id('sync-status-indicator'))).toBeVisible();
      await expect(element(by.text('Online'))).toBeVisible();
    });

    it('should handle sync conflicts', async () => {
      // This would test conflict resolution UI
      // For now, verify sync status is available
      await expect(element(by.id('sync-status-indicator'))).toBeVisible();
    });
  });
});