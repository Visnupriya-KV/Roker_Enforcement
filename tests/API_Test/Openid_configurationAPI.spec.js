const { test, expect, request } = require('@playwright/test');
const config = require('../API_JSON/openIdConfiguration.json'); // Adjust path as needed

test('API_OpenIDConfiguration_Test: OpenID Configuration API', async () => {
  const apiContext = await request.newContext();

  const response = await apiContext.get(config.urls.openidConfiguration);

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const json = await response.json();
  console.log('🔍 OpenID Configuration:', json);

  expect(json.issuer).toContain(config.expected.issuerContains);
  expect(json.authorization_endpoint).toBeDefined();
  expect(json.token_endpoint).toBeDefined();
  expect(json.userinfo_endpoint).toBeDefined();
  expect(json.jwks_uri).toBeDefined();

  expect(json.response_types_supported).toContain(config.expected.responseTypesSupported);
  expect(json.grant_types_supported).toContain(config.expected.grantTypesSupported);
  expect(json.scopes_supported).toContain(config.expected.scopesSupported);
});
