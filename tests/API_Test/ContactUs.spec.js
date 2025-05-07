import { test, expect, request } from '@playwright/test';
import config from '../API_JSON/ContactUs.json';

test('API_ContactUs_Test:OAuth → Login → Capture Token → Call Secured API', async ({ page }) => {
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

  // Step 2: Perform UI login
  await page.goto(config.loginUrl);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(config.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Step 3: Wait for token to be captured
  await page.waitForTimeout(5000);
  expect(accessToken).toBeTruthy();

  // Step 4: Use token to call secured API
  const apiContext = await request.newContext({
    extraHTTPHeaders: {
      ...config.headers,
      authorization: `Bearer ${accessToken}`
    }
  });

  const response = await apiContext.get(config.apiUrl);
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');

  const body = await response.json();
  console.log('📦 API Response:', body);
});
