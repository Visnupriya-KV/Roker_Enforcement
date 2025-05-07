import { test, expect, request } from '@playwright/test';
import config from '../API_JSON/getProductDetail.json'; // Adjust path as needed

test('API_GetProductDetail_Test:Get Product Details API', async ({ page }) => {
  let accessToken = '';

  // Step 1: Capture token from OAuth response
  page.on('response', async (response) => {
    if (response.url().includes(config.urls.tokenEndpoint) && response.request().method() === 'POST') {
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
  await page.goto(config.urls.loginPage);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(config.credentials.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.credentials.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Step 3: Wait for token to be captured
  await page.waitForTimeout(8000);
  expect(accessToken).toBeTruthy();

  // Step 4: Create API context with token
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers,
      'authorization': `Bearer ${accessToken}`
    }
  });

  // Step 5: Call the secured API
  const response = await apiContext.get(config.urls.productDetailAPI);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const responseBody = await response.json();
  console.log('📦 Beautified Response:\n', JSON.stringify(responseBody, null, 2));

  // Step 6: Basic validations
  expect(responseBody).toHaveProperty('version');
});
