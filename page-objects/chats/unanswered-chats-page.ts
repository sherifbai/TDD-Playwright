import { Locator, Page, expect } from '@playwright/test';

import { RouteReadyOptions } from '@utils/interfaces';
import { isEventuallyVisible } from '@utils/waits';
import { waitForChatsReady } from '@utils/waits/admin-page-ready';

export class UnansweredChatsPage {
  private readonly page: Page;

  private readonly list: Locator;
  private readonly activeChatList: Locator;
  private readonly tabs: Locator;
  private readonly buttonTakeOver: Locator;
  private readonly buttonEndChat: Locator;
  private readonly buttonAskAuth: Locator;
  private readonly buttonAskContact: Locator;
  private readonly buttonAskPermission: Locator;
  private readonly buttonForward: Locator;
  private readonly inputMessage: Locator;
  private readonly buttonSendMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.list = this.page.getByRole('tablist');
    this.activeChatList = this.page.getByRole('tablist', { name: 'Active chat list' });
    this.tabs = this.page.getByRole('tab');
    this.buttonTakeOver = this.page.locator('button', { hasText: 'Take Over' });
    this.buttonEndChat = this.page.locator('button', { hasText: 'End chat' });
    this.buttonAskAuth = this.page.locator('button', { hasText: 'Ask for authentication' });
    this.buttonAskContact = this.page.locator('button', { hasText: 'Ask for contact' });
    this.buttonAskPermission = this.page.locator('button', { hasText: 'Ask permission' });
    this.buttonForward = this.page.locator('button', { hasText: 'Forward to colleague' });
    this.inputMessage = this.page.getByPlaceholder(/reply|message|sõnum/i);
    this.buttonSendMessage = this.page.locator('button.btn--primary').filter({ hasNotText: /./ });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForChatsReady(this.page, options);
  }

  getLastListItem(): Locator {
    return this.tabs.last();
  }

  async takeOverLastChat(): Promise<void> {
    await this.waitForReady();
    await this.getLastListItem().click();
    await this.buttonTakeOver.click();
  }

  async takeOverChat(chatId: string): Promise<void> {
    await this.waitForReady();

    const deadline = Date.now() + 60000;

    while (Date.now() < deadline) {
      if (await this.openChat(chatId)) {
        await this.buttonTakeOver.click();
        return;
      }
    }

    throw new Error(`The queue never offered the chat ${chatId}`);
  }

  private async openChat(chatId: string): Promise<boolean> {
    const openChatId = this.page.getByText(chatId, { exact: false });

    for (let index = (await this.tabs.count()) - 1; index >= 0; index--) {
      await this.tabs.nth(index).click();

      if (await isEventuallyVisible(openChatId, 4000)) {
        return true;
      }
    }

    return false;
  }

  async expectChatIsActive(): Promise<void> {
    await expect(this.activeChatList, 'The chat never moved to the operator’s own list').toBeVisible();
    await expect(this.buttonEndChat, 'An active chat offers no way to end it').toBeVisible();
  }

  async expectOperatorReceived(text: string): Promise<void> {
    await expect(
      this.page.getByText(text, { exact: true }),
      `The operator never received "${text}" from the customer`,
    ).toBeVisible({ timeout: 30000 });
  }

  async replyAsOperator(text: string): Promise<void> {
    await expect(this.inputMessage, 'The active chat offered no message input').toBeVisible({ timeout: 15000 });
    await this.inputMessage.fill(text);
    await this.buttonSendMessage.click();
    await expect(
      this.page.getByText(text, { exact: true }),
      'The operator’s own message never appeared in their chat',
    ).toBeVisible({ timeout: 15000 });
  }
}
