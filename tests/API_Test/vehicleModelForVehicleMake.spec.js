import { test, expect, request } from '@playwright/test';
import loginInfo from '../../utils/commonConfig/loginInfo.json';
import headers from '../../utils/commonConfig/headers.json';
import apiEndpoints from '../../utils/commonConfig/apiEndpoints.json';
import vehicleMakeIds from '../../data/API_JSON/vehicleModelForVehicleMake.json';

test.describe('API_VehicleModelForVehicleMake_Tests', () => {
  let cookies = '';
  let apiContext;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    // Step 1: Navigate to login
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

    // Step 4: Setup API context
    apiContext = await request.newContext({
      extraHTTPHeaders: {
        ...headers,
        Cookie: cookies,
      },
    });

    await page.close();
  });

  // Parametrized tests for each VehicleMakeId
  for (const id of vehicleMakeIds.ids) {
    test(`Fetch Vehicle Models for VehicleMakeId=${id}`, async () => {
      const apiUrl = `${apiEndpoints.vehicleModelForVehicleMake}?VehicleMakeId=${id}`;
      console.log('Making API call to URL:', apiUrl);

      const response = await apiContext.get(apiUrl);

      console.log('Response Status:', response.status());
      expect(response.ok()).toBeTruthy();

      const responseBody = await response.json();

      console.log('Response Headers:', response.headers());
      console.log('Response Body:', JSON.stringify(responseBody, null, 2));

      expect(responseBody).toBeDefined();
      expect(Array.isArray(responseBody)).toBeTruthy();
    });
  }
});
