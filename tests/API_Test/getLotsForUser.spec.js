import { test, expect, request } from '@playwright/test';
import loginInfo from '../../data/API_JSON/commonConfig/loginInfo.json';
import headers from '../../data/API_JSON/commonConfig/headers.json';
import apiEndpoints from '../../data/API_JSON/commonConfig/apiEndpoints.json';

test('API_GetLotsForUser_Test: Capture cookies and call getLotsForUser API', async ({ page }) => {
  let cookies = '';

  // Step 1: Navigate to the login page
  console.log('Navigating to login URL:', loginInfo.loginUrl);
  await page.goto(loginInfo.loginUrl);

  // Step 2: Perform login
  console.log('Performing login with email:', loginInfo.email);
  await page.getByRole('textbox', { name: 'Email Address:' }).fill(loginInfo.email);
  await page.getByRole('textbox', { name: 'Password:' }).fill(loginInfo.password);
  await page.getByRole('button', { name: 'Log In' }).click();

  console.log('Login successful.');

  // Step 3: Capture cookies
  const browserCookies = await page.context().cookies();
  cookies = browserCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  console.log('Captured Cookies:', cookies);

  // Step 4: Setup API context with headers + cookies
  console.log('Setting up API context with headers:', {
    ...headers,
    Cookie: cookies,
  });
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      Cookie: cookies,
    },
  });

  // Step 5: Make the API call
  const userId = '67737638-c6e7-41de-ae75-6945f1dc92fd'; // You can also move this to a JSON config
  const apiUrl = `${apiEndpoints.getLotsForUser}?userId=${userId}`;
  console.log('Making API call to URL:', apiUrl);

  const response = await apiContext.get(apiUrl);

  // Step 6: Validate the response
  console.log('Response Status:', response.status());
  expect(response.ok()).toBeTruthy();

  const responseBody = await response.json();

  // Log response
  console.log('Response Headers:', response.headers());
  console.log('Response Body:', JSON.stringify(responseBody, null, 2));

  // Basic validation
  expect(responseBody).toBeDefined();
  expect(Array.isArray(responseBody)).toBeTruthy(); // API should return list of lots
});
