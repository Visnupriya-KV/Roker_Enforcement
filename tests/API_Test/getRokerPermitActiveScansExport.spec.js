import { test, expect, request } from '@playwright/test';
import fs from 'fs'; // Import fs for file operations
import path from 'path'; // Import path for file path handling
import loginInfo from '../../utils/commonConfig/loginInfo.json';
import headers from '../../utils/commonConfig/headers.json';
import apiEndpoints from '../../utils/commonConfig/apiEndpoints.json';
import getRokerPermitActiveScansExportRequestBody from '../../data/API_JSON/getRokerPermitActiveScansExportRequestBody.json';

test('API_GetRokerPermitActiveScansExport_Test: Capture cookies, call Get Roker Permit Active Scans Export API, and save XML file', async ({ page }) => {
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
  const apiUrl = apiEndpoints.getRokerPermitActiveScansExportApi; // Ensure this is defined in apiEndpoints.json
  console.log('Making API call to:', apiUrl);

  const response = await apiContext.post(apiUrl, {
    data: getRokerPermitActiveScansExportRequestBody, // Pass the request body from JSON
  });

  // Step 6: Validate response
  console.log('Response Status:', response.status());
  expect(response.ok()).toBeTruthy();

  // Step 7: Save response as an XML file
  const responseBody = await response.text(); // Get response as plain text
  const exportsDir = path.join(__dirname, '../exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir); // Create the exports directory if it doesn't exist
  }
  const outputFilePath = path.join(exportsDir, 'getRokerPermitActiveScansExport.xml'); // Define the output file path
  fs.writeFileSync(outputFilePath, responseBody, 'utf8'); // Write the XML response to the file
  console.log(`XML response saved to: ${outputFilePath}`);
});