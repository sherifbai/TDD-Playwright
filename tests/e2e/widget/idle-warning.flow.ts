import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { WidgetPage } from '@page-objects/widget';
import { test } from '@setup/test-setup';
import { ADMIN_AUTH_STATE, WIDGET_IDLE_TEST_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { seedEnglishLocale } from '@utils/helpers';
import { MINIMUM_RESPONSE_TIME, createSessionLengthMessage } from '@utils/test-data';

test('[e2e] [widget] An idle customer is warned with the message the session length settings hold', async ({
  browser,
}) => {
  test.setTimeout(WIDGET_IDLE_TEST_TIMEOUT);

  const idleWarningMessage = createSessionLengthMessage('autotest idle warning');

  const csaContext = await browser.newContext({ storageState: ADMIN_AUTH_STATE });
  const customerContext = await browser.newContext();

  try {
    await seedEnglishLocale(customerContext);

    const sessionLength = new AdminPageFactory(await csaContext.newPage()).getSessionLengthPage();

    await sessionLength.whileSettingsAre(
      {
        responseTime: MINIMUM_RESPONSE_TIME,
        displayMessage: true,
        idleWarningMessage,
        showEndMessage: false,
      },
      async () => {
        const cPage = await customerContext.newPage();
        const customerPage = new WidgetPage(cPage);

        await test.step("The customer opens the widget, and the bot's greeting starts the chat", async () => {
          await cPage.goto(URLS.customer);
          await customerPage.openChat();
        });

        await test.step('Left alone for the configured time, the widget asks whether to continue', async () => {
          await customerPage.expectIdleWarningShown(idleWarningMessage);
        });
      },
    );
  } finally {
    await customerContext.close();
    await csaContext.close();
  }
});
