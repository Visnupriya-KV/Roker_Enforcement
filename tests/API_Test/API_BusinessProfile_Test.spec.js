const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/BusinessProfile.json.json');

test('API_BusinessProfile_Test: Business Profile API', async ({ page }) => {
  let accessToken = '';

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

  // Navigate to login page
  await page.goto(config.loginUrl);
  
  // Perform login
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(config.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForTimeout(5000); // Wait for token capture
  expect(accessToken).toBeTruthy();

  // Create API context with Authorization
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers,
      'authorization': `Bearer ${accessToken}`,
    }
  });

  // Make the API call
  const response = await apiContext.get(config.api.businessProfile); // Hitting Business Profile API
  console.log('📡 API Status:', response.status());

  const responseBody = await response.text();
  const beautifiedJson = JSON.stringify(JSON.parse(responseBody), null, 2);
  console.log('API Response:\n', beautifiedJson);

  const json = JSON.parse(responseBody);

  // Basic validations
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(json).toHaveProperty('Result.businesses'); // Adjust key based on Business Profile API response
  expect(Array.isArray(json.Result.businesses)).toBe(true);
  expect(json.Result.businesses.length).toBeGreaterThan(0);
});
