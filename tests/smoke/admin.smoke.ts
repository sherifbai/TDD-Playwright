import { test, expect } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

test('[smoke] Users Page', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/users');
  await expect(page.getByRole('button', { name: 'Add user' })).toBeVisible();
});

test('[smoke] Settings Page', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/chatbot/settings');
  await expect(page.getByLabel('Chatbot active')).toBeVisible();
});

test('[smoke] Welcome message Page', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/chatbot/welcome-message');
  await expect(page.getByLabel('Greeting Active')).toBeVisible();
});

test('[smoke] Appearance Page', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/chatbot/appearance');
  await expect(page.getByRole('switch', { name: 'Widget bubble message text' })).toBeVisible();
});

test('[smoke] Emergency message Page', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/chatbot/emergency-notices');
  await expect(page.getByLabel('Notice active')).toBeVisible();
});

test('[smoke] Feedback Page', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/chatbot/feedback');
  await expect(page.getByLabel('Feedback active')).toBeVisible();
});

test('[smoke] Working time Page', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/working-time');
  await expect(page.getByLabel('Use customer service')).toBeVisible();
});

test('[smoke] Session lenght Page', async ({ page }) => {
  await page.goto(URLS.admin + 'chat/session-length');
  await expect(page.getByLabel('Session length')).toBeVisible();
});
