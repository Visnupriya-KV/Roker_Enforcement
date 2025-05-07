import { test, expect } from '@playwright/test';


test('test', async ({ page }) => {
  await page.goto('https://citycanada.app.develop.rokersmartpermits.com/homepage/default');
  await page.getByRole('link', { name: 'Login as User' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).click();
  await page.getByRole('textbox', { name: 'Email/Username' }).fill('kavyaanand021123@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Roker@2024');
  await page.locator('path').click();
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'My Permits' }).click();
  await page.getByRole('button', { name: 'Common.LblFilter Book a permit' }).click();

  const spinner = page.locator('#spinner');
await spinner.waitFor({ state: 'hidden', timeout: 20000 });

const locationInput = page.getByRole('combobox', { name: 'Enter location or permit type' });
await locationInput.click();

  // await page.getByRole('combobox', { name: 'Enter location or permit type' }).click();
  await page.getByRole('combobox', { name: 'Enter location or permit type' }).fill('[0507] - AM Deck - 1431 Laney Walker Blvd - Location');
  await page.getByRole('combobox', { name: 'Enter location or permit type' }).press('Enter');
  await page.waitForSelector('text=ResidentHOURLY', { timeout: 10000 }); // waits up to 10s
  await page.getByText('ResidentHOURLY').click();

  await page.locator("//label[normalize-space()='Add Vehicle']").click();

  await page.getByRole('button', { name: 'Add Vehicle' }).click();
  // Step 1: Open the dropdown
await page.locator("//kendo-combobox[@formcontrolname='country']//span[@class='k-icon k-i-arrow-s']").click();
//kendo-combobox[@class='k-widget k-combobox k-header k-combobox-clearable ng-pristine ng-valid ng-touched']//span[@class='k-icon k-i-arrow-s']
// Step 2: Wait for the dropdown to render
await page.waitForSelector('ul[role="listbox"]', { timeout: 40000 });
// Step 3: Locate and click the 'OTHER' option
const otherOption = page.locator('//ul[@role="listbox"]//li[contains(@class,"k-item") and normalize-space(.)="CANADA"]');
await otherOption.waitFor({ state: 'visible', timeout: 40000 });
await otherOption.click();

//State
await page.locator(`//kendo-combobox[@formcontrolname='state']//span[@class='k-icon k-i-arrow-s']`).click();
// Wait for and select the "Guam (GU)" option
await page.getByRole('option', { name: 'Alberta (AB)' }).click();

await page.locator("(//app-licence-plat-type//span)[3]").click();
  await page.getByRole('option', { name: 'Commercial1 (Commercial1)' }).click();
  await page.getByRole('textbox', { name: 'License Plate Number' }).click();
  await page.getByRole('textbox', { name: 'License Plate Number' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'License Plate Number' }).fill('Test123Vis');
  //await page.getByRole('textbox', { name: 'License Plate Number' }).fill('AUTOTEST19');
  await page.locator("//kendo-combobox[@formcontrolname='make']//span[@class='k-icon k-i-arrow-s']").click();
  await page.getByRole('option', { name: 'AUDI' }).click();
  await page.locator("//kendo-combobox[@formcontrolname='model']//span[@class='k-icon k-i-arrow-s']").click();
  //await page.locator('div:nth-child(6) > .form-custom-select > .k-widget > .k-dropdown-wrap > .k-select > .k-icon').click();
  await page.getByRole('option', { name: 'A6' }).click();
  await page.locator("//kendo-combobox[@formcontrolname='color']//span[@class='k-icon k-i-arrow-s']").click();
  //await page.locator('div:nth-child(7) > .form-custom-select > .k-widget > .k-dropdown-wrap > .k-select > .k-icon').click();
  //kendo-combobox[@formcontrolname='accepetedDocumentId']//span[@class='k-icon k-i-arrow-s']
  await page.getByRole('option', { name: 'Cream' }).click();
  await page.getByRole('button', { name: 'REGISTER' }).click();
  //await page.getByRole('heading', { name: 'AUDI AUTOTEST19' }).locator('span').click();
  await page.getByText('Test123Vis').click();
  await page.locator('label').filter({ hasText: 'TESLA TESTAUTO01 Commercial (' }).getByRole('paragraph').click();
  await page.getByRole('button', { name: 'Next Next' }).click();
  // Click the dropdown arrow to open the list
await page.locator("//kendo-dropdownlist[@formcontrolname='accepetedDocumentId']//span[contains(@class, 'k-icon') and contains(@class, 'k-i-arrow-s')]").click();
// Select the 'Lot Assignment' option
await page.getByRole('option', { name: 'Lot Assignment' }).click();

  await page.getByRole('button', { name: 'Upload' }).click();
  await page.getByRole('img', { name: 'Profile.png' }).nth(1).click();
  await page.getByRole('link', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Next Next' }).click();
  await page.getByText('12/2028TESTCARDXXXX-XXXX-XXXX-').click();

const allFrames = page.frames();

let cvcFrame = null;

for (const frame of allFrames) {
  try {
    const cvcInput = await frame.locator('input[name="cvc"]');
    if (await cvcInput.count() > 0) {
      // Wait to be sure it's visible
      await cvcInput.waitFor({ state: 'visible', timeout: 5000 });
      cvcFrame = frame;
      await cvcInput.fill('123');
      console.log('✅ Found and filled CVC field');
      break;
    }
  } catch (e) {
    // Ignore frames where input is not found
  }
}

if (!cvcFrame) {
  console.error('❌ CVC input not found in any frame');
}

const checkbox = page.locator('//input[@type="checkbox" and @id="agreeTerms"]');
await checkbox.waitFor({ state: 'visible' }); // Optional safety check
await checkbox.click({ force: true });

  await page.getByRole('button', { name: 'Submit Next' }).click();

// Wait for the success message directly
await page.locator('text=Permit issued').waitFor({ timeout: 100000 });

//await page.getByText('Permit application issued', { exact: true }).waitFor({ timeout: 15000 });
await expect(page.getByText('Permit application issued')).toBeVisible();
// Click 'Done' without waiting for the popup
await page.getByRole('link', { name: 'Done' }).click();

// Click 'Profile Settings' directly in the main page (page)
await page.getByRole('button', { name: 'Profile Settings' }).click();

// Click 'Logout' directly in the main page (page)
await page.getByRole('link', { name: 'Logout' }).click();

});