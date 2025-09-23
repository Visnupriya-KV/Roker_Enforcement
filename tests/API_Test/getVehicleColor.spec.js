import { test, expect, request } from '@playwright/test';
import loginInfo from '../../data/API_JSON/commonConfig/loginInfo.json';
import headers from '../../data/API_JSON/commonConfig/headers.json';
import apiEndpoints from '../../data/API_JSON/commonConfig/apiEndpoints.json';

test('API_GetVehicleColor_Test: Capture cookies and call GetVehicleColor API', async ({ page }) => {
  let cookies = '';

  // Step 1: Navigate to login page
  console.log('Navigating to login URL:', loginInfo.loginUrl);
  await page.goto(loginInfo.loginUrl);

  // Step 2: Perform login
  console.log('Logging in with email:', loginInfo.email);
  await page.getByRole('textbox', { name: 'Email Address:' }).fill(loginInfo.email);
  await page.getByRole('textbox', { name: 'Password:' }).fill(loginInfo.password);
  await page.getByRole('button', { name: 'Log In' }).click();
  console.log('Login successful.');

  // Step 3: Capture cookies
  const browserCookies = await page.context().cookies();
  cookies = browserCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  console.log('Captured Cookies:', cookies);

  // Step 4: Create API context with headers + cookies
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...headers,
      Cookie: cookies, // inject session cookies dynamically
    },
  });

  // Step 5: Call GetVehicleColor API
  const apiUrl = apiEndpoints.getVehicleColor; // keep endpoint in apiEndpoints.json
  console.log('Making API call to URL:', apiUrl);

  const response = await apiContext.get(apiUrl);

  // Step 6: Validate response
  console.log('Response Status:', response.status());
  expect(response.ok()).toBeTruthy();

  const responseBody = await response.json();
  console.log('Response Headers:', response.headers());
  console.log('Response Body:', JSON.stringify(responseBody, null, 2));

});
