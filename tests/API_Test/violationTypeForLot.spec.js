import { test, expect, request } from '@playwright/test';
import loginInfo from '../../data/API_JSON/commonConfig/loginInfo.json';
import headers from '../../data/API_JSON/commonConfig/headers.json';
import apiEndpoints from '../../data/API_JSON/commonConfig/apiEndpoints.json';
import requestParams from '../../data/API_JSON/requestParams.json';

test('API_ViolationTypeForLot_Test: Capture cookies and call violationTypeForLot API', async ({ page }) => {
  let cookies = '';

  // Step 1: Navigate to login page
  console.log('Navigating to login URL:', loginInfo.loginUrl);
  await page.goto(loginInfo.loginUrl);

  // Step 2: Perform login
  console.log('Performing login with email:', loginInfo.email);
  await page.getByRole('textbox', { name: 'Email Address:' }).fill(loginInfo.email);
  await page.getByRole('textbox', { name: 'Password:' }).fill(loginInfo.password);
  await page.getByRole('button', { name: 'Log In' }).click();
  console.log('Login submitted.');

  // Step 3: Capture cookies
  const browserCookies = await page.context().cookies();
  cookies = browserCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  console.log('Captured Cookies:', cookies);

  // Step 4: Setup API context
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      Cookie: cookies,
    },
  });

  // Step 5: Build API URL with query param
  const apiUrl = `${apiEndpoints.violationTypeForLotApi}?lotId=${requestParams.lotId}`;
  console.log('Making API call to:', apiUrl);

  // Step 6: Make API request
  const response = await apiContext.get(apiUrl);

  console.log('Response Status:', response.status());
  expect(response.ok()).toBeTruthy();

  const responseBody = await response.json();

  console.log('Response Headers:', response.headers());
  console.log('Response Body:', JSON.stringify(responseBody, null, 2));

  // Step 7: Basic assertions
  expect(responseBody).toBeDefined();
  expect(Array.isArray(responseBody)).toBeTruthy();
});
