import { test, expect, request } from '@playwright/test';
import { parseStringPromise } from 'xml2js'; // Import xml2js for XML parsing
import fs from 'fs'; // Import fs for file operations
import path from 'path'; // Import path for file path handling
import loginInfo from '../API_JSON/commonConfig/loginInfo.json';
import headers from '../API_JSON/commonConfig/headers.json';
import apiEndpoints from '../API_JSON/commonConfig/apiEndpoints.json';
import sessionSearchExportRequestBody from '../API_JSON/sessionSearchExportRequestBody.json';

test('API_SessionSearchExport_Test: Capture cookies, call Session Search Export API, and save XML', async ({ page }) => {
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
  const apiUrl = apiEndpoints.sessionSearchExportApi; // Ensure this is defined in apiEndpoints.json
  console.log('Making API call to:', apiUrl);

  const response = await apiContext.post(apiUrl, {
    data: sessionSearchExportRequestBody, // Pass the request body from JSON
  });

  // Step 6: Validate response
  console.log('Response Status:', response.status());
  expect(response.ok()).toBeTruthy();

  // Step 7: Handle XML response
  const responseBody = await response.text(); // Get response as plain text
  console.log('Raw XML Response:', responseBody);

  // Step 8: Save XML response to a file
  const exportsDir = path.join(__dirname, '../exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir);
  }
  const outputFilePath = path.join(exportsDir, 'sessionSearchExport.xml'); // Define the output file path
  fs.writeFileSync(outputFilePath, responseBody, 'utf8'); // Write the XML response to the file
  console.log(`XML response saved to: ${outputFilePath}`);

  // Optional: Parse XML to JSON for logging
  try {
    const parsedResponse = await parseStringPromise(responseBody); // Parse XML to JSON
    console.log('Parsed XML Response:', JSON.stringify(parsedResponse, null, 2));
  } catch (error) {
    console.error('Error parsing XML response:', error);
  }
});