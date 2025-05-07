const { test, expect } = require('@playwright/test');

test('First test', async ({ page }) => {
    await page.goto('https://citycanada.app.develop.rokersmartpermits.com/homepage/default');
  
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Roker User Portal/);
  });