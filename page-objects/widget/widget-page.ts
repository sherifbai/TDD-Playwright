import { Locator, Page } from '@playwright/test';

// Locators here stay in Estonian on purpose. The widget lives on the customer site,
// a different origin from the admin, and it only detects its locale from the URL path
// — it ignores the i18nextLng key the admin auth setup seeds. The test host serves no
// /en/ route, so the widget always renders in Estonian.
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
    await this.inputField.fill('Tere');
    await this.sendButton.click();
    // wait for the bot greeting before sending the next message
    await this.bykTitle.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(5000);

    // Ask for a human agent — the bot NLU understands this and offers to route
    // (works regardless of the bot greeting text / language).
    await this.inputField.fill('call a specialist');
    await this.sendButton.click();

    // The bot offers to route to a human with Jah/Ei buttons (not a text answer).
    const routeYes = this.page.getByRole('button', { name: 'Jah', exact: true });
    await routeYes.waitFor({ state: 'visible', timeout: 20000 });
    await routeYes.click();

    await this.page.waitForTimeout(3000);
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
