import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { WidgetPage } from '@page-objects/widget';
import { test } from '@setup/test-setup';
import { ADMIN_AUTH_STATE, MINIMUM_RESPONSE_TIME, WIDGET_IDLE_TEST_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { seedEnglishLocale } from '@utils/helpers';
import { createSessionLengthMessage } from '@utils/test-data';

test(
  '[e2e] [widget] An idle conversation ends with the message the session length settings hold',
  { annotation: { type: 'kiwi case', description: 'https://monitooring.test.buerokratt.ee/case/189/' } },
  async ({ browser }) => {
    test.setTimeout(WIDGET_IDLE_TEST_TIMEOUT);

    const endMessage = createSessionLengthMessage('autotest end message');

    const csaContext = await browser.newContext({ storageState: ADMIN_AUTH_STATE });
    const customerContext = await browser.newContext();

    try {
      await seedEnglishLocale(customerContext);

      const sessionLength = new AdminPageFactory(await csaContext.newPage()).getSessionLengthPage();

      await sessionLength.whileSettingsAre(
        {
          responseTime: MINIMUM_RESPONSE_TIME,
          displayMessage: false,
          showEndMessage: true,
          endMessage,
        },
        async () => {
          const cPage = await customerContext.newPage();
          const customerPage = new WidgetPage(cPage);

          await test.step("The customer opens the widget, and the bot's greeting starts the chat", async () => {
            await cPage.goto(URLS.customer);
            await customerPage.openChat();
          });

          await test.step('Left alone for the configured time, the widget ends the chat with its end message', async () => {
            await customerPage.expectEndMessageShown(endMessage);
          });
        },
      );
    } finally {
      await customerContext.close();
      await csaContext.close();
    }
  },
);
