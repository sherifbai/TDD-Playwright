import { AUTH_FILE, ensureAuthDirectory } from '@auth/auth.helpers';
import { test as setup } from '@setup/test-setup';

setup('authenticate', async ({ page }) => {
  await ensureAuthDirectory(AUTH_FILE);

  await page.goto('/');

  await page.getByRole('button', { name: 'sisene TARA kaudu' }).click();

  const mobiilIdLink = page.getByRole('link', { name: 'Mobiil-ID', exact: true });
  await mobiilIdLink.waitFor({ state: 'visible', timeout: 180000 });
  await mobiilIdLink.click();

  await page.getByRole('textbox', { name: 'Isikukood' }).fill('60001017869');
  await page.getByRole('textbox', { name: 'Telefoninumber' }).fill('68000769');
  await page.getByRole('button', { name: 'Jätka' }).click();

  await page.waitForURL('/chat/landing', {
    timeout: 60000,
  });

  await page.context().storageState({ path: AUTH_FILE });
});
