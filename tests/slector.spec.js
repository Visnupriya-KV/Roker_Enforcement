import { test, expect } from '@playwright/test';

test('Selector demo test', async ({ page }) => {
    await page.goto('https://citycanada.app.develop.rokersmartpermits.com/homepage/default');
    await page.pause();


})