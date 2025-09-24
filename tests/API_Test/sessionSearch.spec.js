import { test, expect, request } from '@playwright/test';
import loginInfo from '../../utils/commonConfig/loginInfo.json';
import headers from '../../utils/commonConfig/headers.json';
import apiEndpoints from '../../utils/commonConfig/apiEndpoints.json';
import sessionSearchRequestBody from '../../data/API_JSON/sessionSearchRequestBody.json';

test('API_SessionSearch_Test: Capture cookies and call Session Search API', async ({ page }) => {
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

  // Step 3: Capture cookies from browser context
  const browserCookies = await page.context().cookies();
  cookies = browserCookies.map(c => `${c.name}=${c.value}`).join('; ');
  console.log('Captured Cookies:', cookies);

  // Step 4: Create new API context with headers + cookies
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      Cookie: cookies, // Inject fresh cookies
    },
  });

  // Step 5: Make the API call
  const apiUrl = apiEndpoints.sessionSearchApi; // Ensure this is defined in apiEndpoints.json
  console.log('Making API call to:', apiUrl);

  const response = await apiContext.post(apiUrl, {
    data: sessionSearchRequestBody, // Pass the request body from JSON
  });

  // Step 6: Validate response
  console.log('Response Status:', response.status());
  expect(response.ok()).toBeTruthy();

  const responseBody = await response.json();
  console.log('Response Headers:', response.headers());
  console.log('Response Body:', JSON.stringify(responseBody, null, 2));
});