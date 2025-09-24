import { test, expect, request } from '@playwright/test';
import loginInfo from '../../utils/commonConfig/loginInfo.json';
import headers from '../../utils/commonConfig/headers.json';
import apiEndpoints from '../../utils/commonConfig/apiEndpoints.json';

test('API_GetVendorMultiBusinessEnabled_Test: Capture cookies and call Vendor API', async ({ page }) => {
  let cookies = '';

  // Step 1: Navigate to the login page
  console.log('Navigating to login URL:', loginInfo.loginUrl);
  await page.goto(loginInfo.loginUrl);

  // Step 2: Perform login
  console.log('Logging in with email:', loginInfo.email);
  await page.getByRole('textbox', { name: 'Email Address:' }).fill(loginInfo.email);
  await page.getByRole('textbox', { name: 'Password:' }).fill(loginInfo.password);
  await page.getByRole('button', { name: 'Log In' }).click();
  console.log('Login successful.');

  // Step 3: Capture cookies from the browser context
  const browserCookies = await page.context().cookies();
  cookies = browserCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  console.log('Captured Cookies:', cookies);

  // Step 4: Create a new API context with headers + cookies
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      Cookie: cookies, // dynamic cookie injection
    },
  });

  // Step 5: Make the API call
  const apiUrl = apiEndpoints.GetVendorMultiBusinessEnabled; 
  console.log('Making API call to URL:', apiUrl);

  const response = await apiContext.get(apiUrl);

  // Step 6: Validate response
  console.log('Response Status:', response.status());
  expect(response.ok()).toBeTruthy();

  const responseBody = await response.json();

  console.log('Response Headers:', response.headers());
  console.log('Response Body:', JSON.stringify(responseBody, null, 2));

  // Assertions
  expect(responseBody).toBeDefined();
  // Example: you can validate a specific key if expected
  // expect(responseBody.isMultiBusinessEnabled).toBe(true);
});
