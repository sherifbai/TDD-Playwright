import { AUTH_FILE, ensureAuthDirectory } from '@auth/auth.helpers';
import { test as setup } from '@setup/test-setup';

setup('authenticate', async ({ page }) => {
  await ensureAuthDirectory(AUTH_FILE);

  // The admin defaults to Estonian. All of its micro-frontends (login shell, chat,
  // services) detect the locale from this key, and storageState carries it over to
  // every other project, so seeding it here renders the whole admin in English.
  await page.addInitScript(() => window.localStorage.setItem('i18nextLng', 'en'));

  await page.goto('/');

  await page.getByRole('button', { name: 'enter via TARA' }).click();

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
