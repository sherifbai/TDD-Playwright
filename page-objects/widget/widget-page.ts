import { Locator, Page, expect } from '@playwright/test';

export class WidgetPage {
  private readonly page: Page;

  private readonly widget: Locator;
  private readonly bykTitle: Locator;
  private readonly inputField: Locator;
  private readonly sendButton: Locator;
  private readonly buttonHamburger: Locator;
  private readonly buttonTC: Locator;
  private readonly buttonMinimize: Locator;
  private readonly buttonClose: Locator;
  private readonly chatRoutedNotice: Locator;
  private readonly operatorAwayNotice: Locator;

  private readonly buttonConfirmWithAnswer: Locator;
  private readonly buttonConfirmNoAnswer: Locator;
  private readonly buttonDeclineClose: Locator;

  private readonly imgFlagsEUSI: Locator;
  private readonly imgFlagsEUTV: Locator;

  private readonly buttonConfirm: Locator;
  private readonly buttonDownload: Locator;
  private readonly inputFeedback: Locator;

  constructor(page: Page) {
    this.page = page;

    this.widget = this.page.getByTitle('Ava vestlus');
    this.bykTitle = this.page.getByRole('heading', { name: 'Bürokratt' });
    this.inputField = this.page.getByPlaceholder('Kirjutage oma sõnum...');
    this.sendButton = this.page.getByTitle('Saada');
    this.buttonHamburger = this.page.getByTitle('Detailid');
    this.buttonTC = this.page.getByText('Tutvuge teenuse tingimustega', { exact: true });
    this.buttonMinimize = this.page.getByTitle('Minimeeri');
    this.buttonClose = this.page.getByTitle('Sulge');
    this.chatRoutedNotice = this.page.getByText('Vestlus suunatakse klienditoele');
    this.operatorAwayNotice = this.page.getByText('Nõustaja on eemal', { exact: false });

    this.buttonConfirmWithAnswer = this.page.getByRole('button', { name: 'Jah, sain vastuse' });
    this.buttonConfirmNoAnswer = this.page.getByRole('button', { name: 'Jah, vastuseta' });
    this.buttonDeclineClose = this.page.getByTitle('Kinnitusnupp ei');

    this.imgFlagsEUSI = this.page.getByAltText('Euroopa Liidu Struktuuri- ja Investeerimisfondid');
    this.imgFlagsEUTV = this.page.getByAltText('Euroopa Liidu taaste- ja vastupidavusrahastu');

    this.buttonConfirm = this.page.getByRole('button', { name: 'Kinnita' });
    this.buttonDownload = this.page.getByRole('button', { name: 'Laadi vestlus alla' });
    this.inputFeedback = this.page.getByPlaceholder('Sisestage oma tagasiside...');
  }

  async openChat(): Promise<void> {
    const visibleWidget = await this.widget.isVisible().catch(() => false);

    if (visibleWidget) {
      await this.widget.click();
    }

    await this.bykTitle.waitFor({ state: 'visible' });
  }

  async getCSAChat(): Promise<void> {
    await this.inputField.fill('call a specialist');
    await this.sendButton.click();

    const routeYes = this.page.getByRole('button', { name: 'Jah', exact: true });
    const offeredRouting = await routeYes.waitFor({ state: 'visible', timeout: 30000 }).then(
      () => true,
      () => false,
    );

    // Whether the bot offers an operator at all depends on its current configuration, and
    // a bare timeout on the button says nothing about which of the known refusals happened:
    // the operator being away, or the bot answering with contact details instead of routing.
    expect(offeredRouting, `The bot never offered to route the chat. Its last reply: "${await this.lastReply()}"`).toBe(
      true,
    );

    await routeYes.click();
    await this.chatRoutedNotice.waitFor({ state: 'visible', timeout: 30000 });
  }

  private async lastReply(): Promise<string> {
    if (await this.operatorAwayNotice.isVisible()) {
      return 'the widget showed the "operator is away" contact form';
    }

    const replies = await this.page.locator('[class*="message"]').allInnerTexts();
    const lastReply = replies
      .map((reply) => reply.trim())
      .filter(Boolean)
      .pop();

    return lastReply?.replace(/\s+/g, ' ') ?? 'the conversation held no messages at all';
  }

  async sendMessage(text: string): Promise<void> {
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
