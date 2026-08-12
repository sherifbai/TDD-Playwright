import { Locator, Page, expect, test } from '@playwright/test';

import { isEventuallyVisible } from '@utils/waits';

export class WidgetPage {
  private readonly page: Page;

  private readonly widget: Locator;
  private readonly bykTitle: Locator;
  private readonly inputField: Locator;
  private readonly sendButton: Locator;
  private readonly buttonHamburger: Locator;

  private readonly buttonConfirm: Locator;
  private readonly inputFeedback: Locator;

  constructor(page: Page) {
    this.page = page;

    this.widget = this.page.getByTitle('Open chat');
    this.bykTitle = this.page.getByRole('heading', { name: 'Bürokratt' });
    this.inputField = this.page.getByPlaceholder('Enter your message...');
    this.sendButton = this.page.getByTitle('Send');
    this.buttonHamburger = this.page.getByTitle('Details');

    this.buttonConfirm = this.page.getByRole('button', { name: 'Confirm' });
    this.inputFeedback = this.page.getByPlaceholder('Enter your feedback...');
  }

  async openChat(): Promise<void> {
    await expect(this.widget, 'The page never drew the chat launcher').toBeVisible({ timeout: 30000 });
    await this.widget.click();
    await this.bykTitle.waitFor({ state: 'visible' });
  }

  /**
   * The notice the bot answers with when no operator is available is a free-text field of the
   * back office's, so it carries whatever wording and language an administrator last typed.
   * The caller reads it from there and passes it in rather than this page assuming a phrase.
   */
  async getCsaChat(noCsaAvailableMessage: string): Promise<void> {
    await this.inputField.fill('I want to talk to a human');
    await this.sendButton.click();

    const routeYes = this.page.getByRole('button', { name: 'Yes', exact: true });
    const offeredRouting = await isEventuallyVisible(routeYes, 30000);

    // Whether the bot offers an operator at all depends on its current configuration, and
    // a bare timeout on the button says nothing about which of the known refusals happened:
    // the operator being away, or the bot answering with contact details instead of routing.
    expect(
      offeredRouting,
      `The bot never offered to route the chat. Its last reply: "${await this.lastReply(noCsaAvailableMessage)}"`,
    ).toBe(true);

    const forwarded = this.page.waitForResponse(
      (response) => response.url().includes('forwards/forward-to-backoffice') && response.request().method() === 'POST',
      { timeout: 30000 },
    );

    await routeYes.click();

    const response = await forwarded;
    expect(response.ok(), `The back office refused to take the chat over with ${response.status()}`).toBeTruthy();
  }

  async chatId(): Promise<string> {
    const stored = await this.page.evaluate(() => window.localStorage.getItem('byk-va-cid'));

    expect(stored, 'The widget never stored an id for the conversation').toBeTruthy();

    return JSON.parse(stored as string);
  }

  private async lastReply(noCsaAvailableMessage?: string): Promise<string> {
    if (noCsaAvailableMessage && (await this.page.getByText(noCsaAvailableMessage, { exact: false }).isVisible())) {
      return 'the widget showed the "no operator available" notice instead of routing the chat';
    }

    const replies = await this.page.locator('[class*="message"]').allInnerTexts();
    const lastReply = replies
      .map((reply) => reply.trim())
      .filter(Boolean)
      .pop();

    return lastReply?.replace(/\s+/g, ' ') ?? 'the conversation held no messages at all';
  }

  private async waitForMessageBox(): Promise<void> {
    if (await isEventuallyVisible(this.inputField, 10000)) {
      return;
    }

    test.info().annotations.push({
      type: 'widget stalled',
      description: `The widget hid its message box until the page was reloaded. Its last reply: "${await this.lastReply()}"`,
    });

    await this.page.reload();

    if (await isEventuallyVisible(this.widget, 15000)) {
      await this.widget.click();
    }

    await expect(this.inputField, 'The widget hid its message box even after a reload').toBeVisible({ timeout: 30000 });
  }

  async sendMessage(text: string): Promise<void> {
    await this.waitForMessageBox();
    await this.inputField.fill(text);
    await this.sendButton.click();
    await expect(this.messageByText(text), 'The widget never echoed the message the customer sent').toBeVisible({
      timeout: 15000,
    });
  }

  async expectMessageDelivered(text: string): Promise<void> {
    await expect(this.messageByText(text), `The customer never received "${text}"`).toBeVisible({ timeout: 30000 });
  }

  async expectMessageNeverDelivered(text: string): Promise<void> {
    await expect(this.messageByText(text), `The customer received "${text}", which nobody sent`).toHaveCount(0);
  }

  private messageByText(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }

  async openDetails(): Promise<void> {
    await this.buttonHamburger.click();
  }

  async giveFeedback(score: string, feedback: string): Promise<void> {
    await this.page.getByRole('button', { name: score }).click();
    await this.inputFeedback.fill(feedback);
    await this.buttonConfirm.click();
  }
}
