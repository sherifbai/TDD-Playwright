import { Locator, Page, expect } from '@playwright/test';

import { RouteReadyOptions } from '@utils/interfaces';
import { waitForChatsReady } from '@utils/waits/admin-page-ready';

export class UnansweredChatsPage {
  private readonly page: Page;

  private readonly list: Locator;
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
    this.tabs = this.page.getByRole('tab');
    this.buttonTakeOver = this.page.locator('button', { hasText: 'Take Over' });
    this.buttonEndChat = this.page.locator('button', { hasText: 'End chat' });
    this.buttonAskAuth = this.page.locator('button', { hasText: 'Ask for authentication' });
    this.buttonAskContact = this.page.locator('button', { hasText: 'Ask for contact' });
    this.buttonAskPermission = this.page.locator('button', { hasText: 'Ask permission' });
    this.buttonForward = this.page.locator('button', { hasText: 'Forward to colleague' });
    this.inputMessage = this.page.getByPlaceholder(/message|sõnum/i);
    this.buttonSendMessage = this.page.getByRole('button', { name: /^send/i });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForChatsReady(this.page, options);
  }

  getLastListItem(): Locator {
    return this.tabs.last();
  }

  async acceptChat(): Promise<void> {
    await this.waitForReady();
    await this.getLastListItem().click();
    await this.buttonTakeOver.click();
  }

  async acceptChatContaining(text: string): Promise<void> {
    await this.waitForReady();

    const queuedChat = this.tabs.filter({ hasText: text });
    await expect(queuedChat, `No chat in the queue contains "${text}"`).toBeVisible({ timeout: 30000 });

    await queuedChat.click();
    await this.buttonTakeOver.click();
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
