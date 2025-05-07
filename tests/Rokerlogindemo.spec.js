import { test, expect } from '@playwright/test';

test('Roker demo test', async ({ page }) => {
  await page.goto('https://citycanada.app.develop.rokersmartpermits.com/homepage/default');
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill('kavyaanand021123@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Roker@2024');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('button', { name: 'Profile Settings' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
});