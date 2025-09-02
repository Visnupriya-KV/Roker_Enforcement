import { test, expect, request } from '@playwright/test';
import loginInfo from '../API_JSON/commonConfig/loginInfo.json';
import headers from '../API_JSON/commonConfig/headers.json';
import apiEndpoints from '../API_JSON/commonConfig/apiEndpoints.json';
import isDuplicateData from '../API_JSON/isDuplicate.json';

test.describe('API_IsDuplicate_Tests', () => {
  let cookies = '';
  let apiContext;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    // Step 1: Login
    console.log('Navigating to login URL:', loginInfo.loginUrl);
    await page.goto(loginInfo.loginUrl);
    await page.getByRole('textbox', { name: 'Email Address:' }).fill(loginInfo.email);
    await page.getByRole('textbox', { name: 'Password:' }).fill(loginInfo.password);
    await page.getByRole('button', { name: 'Log In' }).click();
    console.log('Login successful.');

    // Step 2: Capture cookies
    const browserCookies = await page.context().cookies();
    cookies = browserCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    console.log('Captured Cookies:', cookies);

    // Step 3: Setup API context
    apiContext = await request.newContext({
      extraHTTPHeaders: {
        ...headers,
        Cookie: cookies,
      },
    });

    await page.close();
  });

  // Loop through test cases from JSON
  for (const testCase of isDuplicateData.testCases) {
    test(`Check duplicate for ViolationNumber=${testCase.violationnumber}`, async () => {
      const apiUrl = `${apiEndpoints.isDuplicate}?violationnumber=${testCase.violationnumber}&violationId=${testCase.violationId}&isChecked=${testCase.isChecked}`;
      console.log('Making API call to URL:', apiUrl);

      const response = await apiContext.get(apiUrl);

      console.log('Response Status:', response.status());
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();
      console.log('Response Body:', JSON.stringify(responseBody, null, 2));

      expect(responseBody).toBeDefined();
    });
  }
});
