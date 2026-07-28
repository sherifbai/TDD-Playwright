import { openAdminPage } from '@helpers/smoke-helpers';
import { expect, test } from '@setup/test-setup';

test('[smoke] Chatbot settings page loads with its active toggle', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/chatbot/settings');

  await expect(page.getByLabel('Chatbot active')).toBeVisible();
  visit.assertBackendAnswered();
});

test('[smoke] Welcome message page loads with its greeting toggle', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/chatbot/welcome-message');

  await expect(page.getByLabel('Greeting Active')).toBeVisible();
  visit.assertBackendAnswered();
});

test('[smoke] Appearance page loads with its widget switches', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/chatbot/appearance');

  await expect(page.getByRole('switch', { name: 'Widget bubble message text' })).toBeVisible();
  visit.assertBackendAnswered();
});

test('[smoke] Emergency notices page loads with its notice toggle', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/chatbot/emergency-notices');

  await expect(page.getByLabel('Notice active')).toBeVisible();
  visit.assertBackendAnswered();
});

test('[smoke] Feedback page loads with its feedback toggle', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/chatbot/feedback');

  await expect(page.getByLabel('Feedback active')).toBeVisible();
  visit.assertBackendAnswered();
});

test('[smoke] Working time page loads with its customer service toggle', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/working-time');

  await expect(page.getByLabel('Use customer service')).toBeVisible();
  visit.assertBackendAnswered();
});

test('[smoke] Session length page loads with its session length field', async ({ page }) => {
  const visit = await openAdminPage(page, 'chat/session-length');

  await expect(page.getByLabel('Session length')).toBeVisible();
  visit.assertBackendAnswered();
});
