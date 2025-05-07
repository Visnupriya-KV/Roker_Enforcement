const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/ProfileById.json'); 

test('API_ProfileById_Test: GET Business Profile by ID', async ({ page }) => {
  let accessToken = '';

  // Step 1: Capture token from OAuth response
  page.on('response', async (response) => {
    if (response.url().includes(config.tokenEndpoint) && response.request().method() === 'POST') {
      try {
        const json = await response.json();
        accessToken = json.access_token;
        console.log('✅ Access Token:', accessToken);
      } catch (err) {
        console.error('❌ Failed to parse token response:', err);
      }
    }
  });

  // Step 2: Perform UI Login
  await page.goto(config.loginUrl);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(config.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Step 3: Wait for token to be captured
  await page.waitForTimeout(5000);
  expect(accessToken).toBeTruthy();

  // Step 4: Use token to call secured GET API
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers,
      'authorization': `Bearer ${accessToken}`,
    }
  });

  const response = await apiContext.get(config.api.getBusinessById);
  console.log('📡 API Status:', response.status());

  const responseBody = await response.text();
  const beautifiedJson = JSON.stringify(JSON.parse(responseBody), null, 2);
  console.log('📦 Beautified API Response:\n', beautifiedJson);

  const json = JSON.parse(responseBody);

  // ✅ Validations
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
});
