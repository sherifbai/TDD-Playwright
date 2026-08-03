import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { WidgetPage } from '@page-objects/widget';

import { expect, test } from '@setup/test-setup';
import { URLS } from '@utils/env/urls';

const stamp = () => Date.now().toString();

test('[e2e] [chats] A routed chat carries messages both ways between customer and operator', async ({ browser }) => {
  const customerMarker = `customer says ${stamp()}`;
  const operatorMarker = `operator says ${stamp()}`;
  const neverSentMarker = `nobody sent this ${stamp()}`;

  const customerContext = await browser.newContext();
  const csaContext = await browser.newContext({ storageState: 'tests/admin/.auth/user.json' });

  try {
    const cPage = await customerContext.newPage();
    const page = await csaContext.newPage();

    const csaPage = new AdminPageFactory(page);
    const customerPage = new WidgetPage(cPage);
    const chats = csaPage.getChats();

    await test.step('An operator is on duty and watching the queue', async () => {
      await page.goto(`${URLS.admin}chat/unanswered`);
      await csaPage.getPageHeader().markCSAPresent();
    });

    await test.step('The customer asks for an agent and gets routed', async () => {
      await cPage.goto(URLS.customer);
      await customerPage.openChat();
      await customerPage.getCSAChat();
    });

    await test.step('The customer sends a marker while waiting in the queue', async () => {
      await customerPage.sendMessage(customerMarker);
    });

    await test.step('The operator picks up that very chat and reads the marker', async () => {
      await chats.takeOverChatContaining(customerMarker);
      await chats.expectOperatorReceived(customerMarker);

      await expect(page.getByRole('tablist', { name: 'Active chat list' })).toBeVisible();
      await expect(page.getByText('End chat')).toBeVisible();
    });

    await test.step('The operator answers and only that answer reaches the customer', async () => {
      await chats.replyAsOperator(operatorMarker);

      await customerPage.expectMessageDelivered(operatorMarker);
      await customerPage.expectMessageNeverDelivered(neverSentMarker);
    });
  } finally {
    await customerContext.close();
    await csaContext.close();
  }
});
