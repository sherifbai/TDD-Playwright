import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { WidgetPage } from '@page-objects/widget';
import { test } from '@setup/test-setup';
import { ADMIN_AUTH_STATE, IDLE_WARNING_TEST_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { seedEnglishLocale } from '@utils/helpers';
import { SessionLengthSettings } from '@utils/interfaces';
import { MINIMUM_RESPONSE_TIME, createChatMarker, createSessionLengthMessage } from '@utils/test-data';

test('[e2e] [widget] An idle customer is warned with the message the session length settings hold', async ({
  browser,
}) => {
  test.setTimeout(IDLE_WARNING_TEST_TIMEOUT);

  const idleWarningMessage = createSessionLengthMessage('autotest idle warning');
  const customerMarker = createChatMarker('the customer wrote');

  const csaContext = await browser.newContext({ storageState: ADMIN_AUTH_STATE });
  const customerContext = await browser.newContext();

  const sessionLength = new AdminPageFactory(await csaContext.newPage()).getSessionLengthPage();
  let settingsBeforeRun: SessionLengthSettings | undefined;

  try {
    await seedEnglishLocale(customerContext);

    await test.step('The stand warns after the shortest response time it accepts', async () => {
      await sessionLength.open();
      settingsBeforeRun = await sessionLength.readSettings();

      await sessionLength.applySettings({
        ...settingsBeforeRun,
        responseTime: MINIMUM_RESPONSE_TIME,
        displayMessage: true,
        idleWarningMessage,
        showEndMessage: false,
      });
      await sessionLength.saveSettings();
      await sessionLength.assertSaveWasConfirmed();
    });

    const cPage = await customerContext.newPage();
    const customerPage = new WidgetPage(cPage);

    await test.step('The customer opens the widget and writes once, which starts the chat', async () => {
      await cPage.goto(URLS.customer);
      await customerPage.openChat();
      await customerPage.sendMessage(customerMarker);
    });

    await test.step('Left alone for the configured time, the widget asks whether to continue', async () => {
      await customerPage.expectIdleWarningShown(idleWarningMessage);
    });
  } finally {
    if (settingsBeforeRun) {
      await sessionLength.open();
      await sessionLength.applySettings(settingsBeforeRun);
      await sessionLength.saveSettings();
      await sessionLength.assertSaveWasConfirmed();
    }

    await customerContext.close();
    await csaContext.close();
  }
});
