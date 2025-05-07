import { test, expect } from '@playwright/test';

test('Roker Admin login test', async ({ page }) => {
  await page.goto('https://citycanada.app.develop.rokersmartpermits.com/homepage/default');
  await page.getByRole('link', { name: 'Login as Administrator' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill('vvenkateshwaran@spplus.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Visnu@2002');
  await page.locator('form').getByRole('img').click();
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
});