import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT, CHAT_LOG_TIMEOUT, ENDED_CHATS_PATH, TABLE_SETTLE_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { AnonymizedText, RouteReadyOptions } from '@utils/interfaces';
import { waitForHistoryReady } from '@utils/waits';

export class HistoryPage {
  private readonly page: Page;

  private readonly rows: Locator;
  private readonly transcript: Locator;
  private readonly customerMessages: Locator;
  private readonly botMessages: Locator;

  constructor(page: Page) {
    this.page = page;

    this.rows = this.page.locator('tbody tr');

    this.transcript = this.page.locator('.historical-chat__group-wrapper');
    this.customerMessages = this.transcript.locator('.historical-chat__group--end-user .historical-chat__message-text');
    this.botMessages = this.transcript.locator('.historical-chat__group--buerokratt .historical-chat__message-text');
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForHistoryReady(this.page, options);
  }

  async open(): Promise<void> {
    const endedChatsLoaded = this.page.waitForResponse(
      (response) => response.url().includes(ENDED_CHATS_PATH) && response.ok(),
      { timeout: ACTION_TIMEOUT },
    );

    await this.page.goto(`${URLS.admin}chat/history`);
    await this.waitForReady();
    await endedChatsLoaded;
  }

  async openChat(chatId: string): Promise<void> {
    const row = this.chatRow(chatId);

    await expect(async () => {
      await this.open();
      await expect(row, `The chat log never listed the conversation ${chatId}`).toBeVisible({
        timeout: TABLE_SETTLE_TIMEOUT,
      });
    }).toPass({ timeout: CHAT_LOG_TIMEOUT });

    await row.getByRole('button', { name: 'View', exact: true }).click();
    await expect(this.transcript, `The chat log never opened the transcript of ${chatId}`).toBeVisible({
      timeout: ACTION_TIMEOUT,
    });
  }

  async expectCustomerMessagesAnonymize({ hidden, kept }: AnonymizedText): Promise<void> {
    await expect(async () => {
      const messages = (await this.customerMessages.allInnerTexts()).join('\n');

      expect(messages, 'The chat log holds no message the customer sent').not.toBe('');

      for (const value of hidden) {
        expect(messages, `The chat log recorded "${value}" the customer sent as it was typed`).not.toContain(value);
      }

      for (const value of kept) {
        expect(messages, `The message the customer sent lost "${value}"`).toContain(value);
      }
    }).toPass({ timeout: ACTION_TIMEOUT });
  }

  async expectBotMessage(text: string): Promise<void> {
    await expect(
      this.botMessages.filter({ hasText: text }).first(),
      `The chat log holds no message of the bot's reading "${text}"`,
    ).toBeVisible({ timeout: ACTION_TIMEOUT });
  }

  private chatRow(chatId: string): Locator {
    return this.rows.filter({ hasText: chatId.slice(0, 8) }).first();
  }
}
