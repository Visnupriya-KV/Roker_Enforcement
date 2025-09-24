import { test, expect, request } from '@playwright/test';
import loginInfo from '../../utils/commonConfig/loginInfo.json';
import headers from '../../utils/commonConfig/headers.json';
import apiEndpoints from '../../utils/commonConfig/apiEndpoints.json';

test('API_ViolationStatus_Test: Login and capture cookies for violation Status API call', async ({ page }) => {
  let cookies = '';

  // Step 1: Navigate to the login page
  console.log('Navigating to login URL:', loginInfo.loginUrl);
  await page.goto(loginInfo.loginUrl);

  // Step 2: Perform login
  console.log('Performing login with email:', loginInfo.email);
  await page.getByRole('textbox', { name: 'Email Address:' }).click();
  await page.getByRole('textbox', { name: 'Email Address:' }).fill(loginInfo.email);
  await page.getByRole('textbox', { name: 'Password:' }).click();
  await page.getByRole('textbox', { name: 'Password:' }).fill(loginInfo.password);
  await page.getByRole('button', { name: 'Log In' }).click();

  console.log('Login successful.');

  // Step 3: Capture cookies from the browser context
  const browserCookies = await page.context().cookies();
  cookies = browserCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  console.log('Captured Cookies:', cookies);

  // Step 4: Create a new API context with the captured cookies
  console.log('Setting up API context with headers:', {
    ...headers,
    Cookie: cookies,
  });
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      Cookie: cookies, // Pass the captured cookies
    },
  });

  // Step 5: Make the API call
  const apiUrl = apiEndpoints.violationStatus;
  console.log('Making API call to URL:', apiUrl);
  const response = await apiContext.get(apiUrl);

  // Validate the API response
  console.log('Response Status:', response.status());
  expect(response.ok()).toBeTruthy();
  const responseBody = await response.json();

  // Log the response details
  console.log('Response Headers:', response.headers());
  console.log('Response Body:', JSON.stringify(responseBody, null, 2));

  // Add assertions based on the expected response structure
  expect(responseBody).toBeDefined();
});