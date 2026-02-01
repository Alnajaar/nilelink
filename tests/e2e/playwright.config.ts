import { defineConfig, devices } from '@playwright/test';

/**
 * NileLink E2E Test Configuration
 * 
 * This configures Playwright to test the integrated flow between:
 * - Customer App (App A)
 * - POS App (App B)
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1, // Single worker to avoid blockchain/db race conditions
    reporter: 'html',
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        viewport: { width: 1280, height: 720 },
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: [
    //   {
    //     command: 'npm run dev --prefix ../../web/customer',
    //     url: 'http://localhost:3000',
    //     reuseExistingServer: !process.env.CI,
    //   },
    //   {
    //     command: 'npm run dev --prefix ../../web/pos -p 3001',
    //     url: 'http://localhost:3001',
    //     reuseExistingServer: !process.env.CI,
    //   }
    // ],
});
