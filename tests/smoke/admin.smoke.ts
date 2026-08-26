import { expect, test } from '@setup/test-setup';
import { openAdminPage } from '@utils/helpers';

test('[SMOKE] "Administration" → "Users" page loads with the user list from the backend', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/users');

  await expect(page.getByRole('button', { name: 'Add user' })).toBeVisible();
  await expect(page.getByRole('table').first().locator('tbody tr').first()).toBeVisible();

  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Administration" → "Settings" page loads with its active toggle', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/chatbot/settings');

  await expect(page.getByLabel('Chatbot active')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Administration" → "Welcome message" page loads with its greeting toggle', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/chatbot/welcome-message');

  await expect(page.getByRole('heading', { name: 'Welcome Message', exact: true })).toBeVisible();
  await expect(page.locator('main').getByRole('switch')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Administration" → "Appearance and behavior" page loads with its widget switches', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/chatbot/appearance');

  await expect(page.getByRole('switch', { name: 'Widget bubble message text' })).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Administration" → "Emergency notices" page loads with its notice toggle', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/chatbot/emergency-notices');

  await expect(page.getByLabel('Notice active')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Administration" → "Feedback" page loads with its feedback toggle', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/chatbot/feedback');

  await expect(page.getByLabel('Feedback active')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Administration" → "Office opening hours" page loads with its customer service toggle', async ({
  page,
}) => {
  const visit = await openAdminPage(page, 'chat/working-time');

  await expect(page.getByLabel('Use customer service')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

test('[SMOKE] "Administration" → "Session length" page loads with its session length field', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/session-length');

  await expect(page.getByLabel('Session length')).toBeVisible();
  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

// Kiwi case: https://monitooring.test.buerokratt.ee/case/156/
test('[SMOKE] "Administration" → "Delete Conversations" page loads with its removal toggles', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/delete-conversations');

  await expect(page.getByRole('heading', { name: 'Conversation deletion', exact: true })).toBeVisible();
  await expect(page.getByText('Automatic expiration and deletion rules', { exact: true })).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Authenticated conversations removal' })).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Anonymous conversations removal' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();

  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});

// Kiwi case: https://monitooring.test.buerokratt.ee/case/151/
test('[SMOKE] "Administration" → "Multi-Domains" page loads with its domain rows and controls', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/multi-domains');

  await expect(page.getByRole('heading', { name: 'Multidomains', exact: true })).toBeVisible();
  await expect(page.getByLabel('1. Domain name')).toBeVisible();
  await expect(page.getByLabel('URL', { exact: true }).first()).toBeVisible();

  const domainNames = page.locator('main input[name^="widgetDomains."][name$=".name"]');
  const domainUrls = page.locator('main input[name^="widgetDomains."][name$=".url"]');

  const deleteButtons = page.locator('main button.btn--error');
  const rowCount = await domainNames.count();

  expect(rowCount, 'the page must list at least one domain').toBeGreaterThan(0);
  await expect(domainUrls).toHaveCount(rowCount);
  await expect(deleteButtons).toHaveCount(rowCount);
  await expect(deleteButtons.first()).toBeVisible();

  await expect(page.getByRole('button', { name: 'Add new', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();

  visit.assertBackendAnswered();
  visit.assertNoFailedApiCalls();
});
