const { test, expect } = require('@playwright/test');
const playwright = require('playwright');
const config = require('../API_JSON/userInfo.json');

test('API_UserInfo_Test: User info API', async ({ page }) => {
  let accessToken = '';

  page.on('response', async (response) => {
    if (response.url().includes(config.oauth.tokenEndpoint) && response.request().method() === 'POST') {
      const json = await response.json();
      accessToken = json.access_token;
      console.log('✅ Access Token:', accessToken);
    }
  });

  await page.goto(config.loginUrl);
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill(config.login.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(config.login.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForTimeout(5000);
  expect(accessToken).toBeTruthy();

  const apiContext = await playwright.request.newContext({
    extraHTTPHeaders: {
      authorization: `Bearer ${accessToken}`
    }
  });

  const userInfoRes = await apiContext.get(config.oauth.userinfoEndpoint);
  expect(userInfoRes.ok()).toBeTruthy();

  const userInfo = await userInfoRes.json();
  console.log('🔍 User Info:', userInfo);

  expect(userInfo).toMatchObject(config.expectedUserInfo);
});
