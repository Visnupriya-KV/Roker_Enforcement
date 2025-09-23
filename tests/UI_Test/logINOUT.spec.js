import { test, expect } from '@playwright/test';
import urls from '../../data/UI_JSON/UI_URLs/urls.json';
import testData from '../../data/UI_JSON/UI_TestData/logIn.json';
import fs from 'fs';
import Papa from 'papaparse'; // npm install papaparse


// Read CSV
const file = fs.readFileSync('./Testcase.csv', 'utf8');
const records = Papa.parse(file, { header: true }).data;

test.use({ headless: false }); // headed mode

// Loop through CSV rows
for (const row of records) {
  if (row.Control === 'Y' && row.TestCaseID === 'UI_Login_Test') {
    test(`${row.TestCaseID} - ${row.Description}`, async ({ page }) => {
      // ---------------- VALID LOGIN ----------------
      await page.goto(urls.loginPage);

      await page.getByRole('textbox', { name: 'Email Address:' }).fill(testData.validUser.email);
      await page.getByRole('textbox', { name: 'Password:' }).fill(testData.validUser.password);
      await page.getByRole('checkbox', { name: 'Remember Me' }).check();
      await page.getByRole('button', { name: 'Log In' }).click();

      // Validation: Logged in
      await expect(page.getByRole('listitem').filter({ hasText: 'Log Out' }))
        .toBeVisible({ timeout: 5000 });

      // Logout
      await page.getByRole('listitem').filter({ hasText: 'Log Out' }).click();
      await expect(page).toHaveURL(urls.loginPage);

      // ---------------- INVALID LOGIN ----------------
      await page.goto(urls.loginPage);

      await page.getByRole('textbox', { name: 'Email Address:' }).fill(testData.invalidUser.email);
      await page.getByRole('textbox', { name: 'Password:' }).fill(testData.invalidUser.password);
      await page.getByRole('button', { name: 'Log In' }).click();

      // Validation: Error message
      await expect(page.getByText(/invalid|incorrect|authentication failed/i))
        .toBeVisible({ timeout: 5000 });
    });
  }
}
