import { test, expect } from '@playwright/test';

test('Book a Permit Flow - Roker', async ({ page }) => {
  // 🔹 XPATH SELECTORS
  const emailInputXPath = '//input[@placeholder="Email/Username"]';
  const passwordInputXPath = '//input[@placeholder="Password"]';
  const loginButtonXPath = '//button[normalize-space()="Log in"]';
  const bookPermitButtonXPath = '//button[contains(.,"Book a permit")]';
  const locationInputXPath = '//input[contains(@placeholder,"Enter location or permit type")]';
  const residentHourlyTextXPath = "//div[@class='row new_wrapscroll']//div[@class='card_blockpermits']//div[@class='card_innerdetails']//b[normalize-space()='Resident']";
  const nextButtonXPath = "//span[normalize-space()='Next']";
  const vehicleTypeTextXPath = '//*[contains(text(),"TESLA TESTAUTO01 Commercial")]';
  const licensePlateSelectorXPath = '//label[contains(.,"COOPER CYCLES 10UIYTRDFGH")]//p';
  const lotAssignmentOptionXPath = '//li[contains(.,"Lot Assignment")]';
  const uploadButtonXPath = '//button[contains(.,"Upload")]';
  const profileImageXPath = '(//label[contains(.,"Profile.png")])[2]';
  const addLinkXPath = '//a[contains(.,"Add")]';
  const creditCardTextXPath = '//*[contains(text(),"12/2028TESTCARDXXXX-XXXX-XXXX-")]';
  const agreeCheckboxXPath = '//input[@type="checkbox" and @id="agreeTerms"]';
  const submitButtonXPath = '//button[contains(.,"Submit Next")]';
  const applicationNumberXPath = '//div[contains(text(),"RSAAAKF9")]';
  const doneLinkXPath = '//a[contains(.,"Done")]';
  const profileSettingsButtonXPath = '//button[contains(.,"Profile Settings")]';
  const logoutLinkXPath = '//a[contains(.,"Logout")]';

  // 🔹 TEST FLOW
  await page.goto('https://citycanada.app.develop.rokersmartpermits.com/homepage/default');

  // Login
  await page.click('text=Login as User');
  await page.locator(emailInputXPath).fill('kavyaanand021123@gmail.com');
  await page.locator(passwordInputXPath).fill('Roker@2024');
  await page.locator('svg').click(); // optional visibility toggle
  await page.locator(loginButtonXPath).click();

  // Book a permit
  await page.locator(bookPermitButtonXPath).click();
  const locationInput = page.locator(locationInputXPath);
  await locationInput.click();
  await locationInput.fill('[0507] - AM Deck - 1431 Laney Walker Blvd - Location');
  await locationInput.press('Enter');

  // Select permit type
  // await page.waitForSelector(residentHourlyTextXPath, { timeout: 10000 });
  // await page.locator(residentHourlyTextXPath).click();
  // await page.locator(nextButtonXPath).click();

  await page.waitForSelector('text=ResidentHOURLY', { timeout: 10000 }); // waits up to 10s
  await page.getByText('ResidentHOURLY').click();
  await page.locator(nextButtonXPath).click();

  await page.locator(vehicleTypeTextXPath).click();
  await page.locator(licensePlateSelectorXPath).click();

  // Continue
  await page.locator(nextButtonXPath).click();
  await page.locator('role=listbox').locator('span').nth(2).click();
  await page.locator(lotAssignmentOptionXPath).click();

  // Upload and add
  await page.locator(uploadButtonXPath).click();
  await page.locator(profileImageXPath).click();
  await page.locator(addLinkXPath).click();
  await page.locator(nextButtonXPath).click();

  // Payment and Terms
  await page.locator(creditCardTextXPath).click();
  const allFrames = page.frames();
  let cvcFrame = null;
  for (const frame of allFrames) {
    try {
      const cvcInput = await frame.locator('input[name="cvc"]');
      if (await cvcInput.count() > 0) {
        await cvcInput.waitFor({ state: 'visible', timeout: 5000 });
        cvcFrame = frame;
        await cvcInput.fill('123');
        break;
      }
    } catch {}
  }
  if (!cvcFrame) console.error('❌ CVC input not found in any frame');

  await page.locator(agreeCheckboxXPath).waitFor({ state: 'visible' });
  await page.locator(agreeCheckboxXPath).click({ force: true });

  // Submit
  await page.locator(submitButtonXPath).click();

  // Final navigation
  await page.goto('https://citycanada.app.develop.rokersmartpermits.com/smart-permits/application-received?appNo=RSAAAKF9&totalPaid=141.48&permitAppId=MTkyMzY%3D&permitNumber=RS05YSPN&startDate=2025-04-24T00:00:00&endDate=2025-04-24T00:00:00&from=10:00%20AM&to=11:59%20PM&location=AM%20Deck%20-%201431%20Laney%20Walker%20Blvd&licensePlateNo=TESTAUTO01,10UIYTRDFGH');
  await page.locator(applicationNumberXPath).click();
  await page.locator(doneLinkXPath).click();
  await page.locator(profileSettingsButtonXPath).click();
  await page.locator(logoutLinkXPath).click();
});
