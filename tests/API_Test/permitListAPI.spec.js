import { test, expect, request } from '@playwright/test';
import config from "../API_JSON/permitList.json";

test('API_Permits_Test: Permit List API', async ({ page }) => {
  let accessToken = '';

  // Step 1: Capture token from OAuth response
  page.on('response', async (response) => {
    if (response.url().includes('/connect/token') && response.request().method() === 'POST') {
      try {
        const json = await response.json();
        accessToken = json.access_token;
        console.log('✅ Access Token:', accessToken);
      } catch (err) {
        console.error('❌ Failed to parse token response:', err);
      }
    }
  });

  // Step 2: Perform UI login
  await page.goto('https://citycanada.app.develop.rokersmartpermits.com/homepage/default');
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(config.credentials.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.credentials.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Step 3: Wait for token to be captured
  await page.waitForTimeout(5000);
  expect(accessToken).toBeTruthy();

  // Step 4: Use token to call secured API
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      authorization: `Bearer ${accessToken}`
    }
  });

  const response = await apiContext.post(
    'https://api.develop.rokersmartpermits.com/permit/permits/list',
    { data: config.requestBody }
  );

  // Step 5: Assertions and Validations
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  const responseBody = await response.json();
  expect(responseBody).toHaveProperty('Result.data');
  expect(Array.isArray(responseBody.Result.data)).toBe(true);

  const data = responseBody.Result.data;
  console.log('📦 Full API Response:', JSON.stringify(data, null, 2));
});


