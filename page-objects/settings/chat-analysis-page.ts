import { Locator, Page, Response, expect } from '@playwright/test';

import { ACTION_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { ChatAnalysisLabelSection, RouteReadyOptions } from '@utils/interfaces';
import { waitForChatAnalysisReady } from '@utils/waits';

export class ChatAnalysisPage {
  private readonly page: Page;

  private readonly headingChatAnalysis: Locator;

  private readonly domainTabs: Locator;
  private readonly domainTabsActive: Locator;
  private readonly buttonCopyToDomain: Locator;

  private readonly labelChatAnalysisSwitch: Locator;
  private readonly switchChatAnalysis: Locator;

  private readonly labelSections: Locator;
  private readonly buttonSave: Locator;

  private readonly deleteDialog: Locator;
  private readonly buttonConfirmDelete: Locator;
  private readonly toastList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.headingChatAnalysis = this.page.getByRole('heading', { name: 'Chat analysis management', exact: true });

    this.domainTabs = this.page.locator('main .domain-tab-selector__tab');
    this.domainTabsActive = this.page.locator('main .domain-tab-selector__tab--active');
    this.buttonCopyToDomain = this.page.locator('main').getByRole('button', { name: 'Copy to domain' });

    this.labelChatAnalysisSwitch = this.page.locator('main div.switch label.switch__label').first();
    this.switchChatAnalysis = this.page.locator('main div.switch button.switch__button').first();

    this.labelSections = this.page.locator('main .label-section');
    this.buttonSave = this.page.locator('main').getByRole('button', { name: 'Save', exact: true });

    this.deleteDialog = this.page.getByRole('dialog');
    this.buttonConfirmDelete = this.deleteDialog.getByRole('button', { name: 'Delete', exact: true });

    this.toastList = this.page.locator('ol.toast__list');
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForChatAnalysisReady(this.page, options);
  }

  async open(): Promise<void> {
    const settingsLoaded = this.settingsLoaded();

    await this.page.goto(URLS.admin + 'chat/chat-analysis');
    await this.waitForReady();
    await settingsLoaded;
  }

  async assertPageIsShown(): Promise<void> {
    await expect(this.headingChatAnalysis, 'Chat analysis never rendered its heading').toBeVisible();
    await expect(this.buttonSave, 'The page offers no way to save the chat analysis settings').toBeVisible();
  }

  async assertDomainTabsAreShown({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.domainTabs.first(), 'The page rendered no domain tab').toBeVisible({ timeout });
    await expect(this.domainTabsActive, 'The domain tabs left no domain selected').toHaveCount(1);
  }

  async selectFirstDomainTab({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    const tab = this.domainTabs.first();

    await expect(tab, 'The page rendered no domain tab to select').toBeVisible({ timeout });

    const settingsLoaded = this.settingsLoaded({ timeout });

    await tab.click();
    await expect(tab, 'The domain that was picked did not become the selected one').toHaveClass(
      /domain-tab-selector__tab--active/,
      { timeout },
    );
    await settingsLoaded;
  }

  async assertCopyToDomainIsOffered(): Promise<void> {
    await expect(
      this.buttonCopyToDomain,
      'The page offers no way to copy the settings to another domain',
    ).toBeVisible();
  }

  async assertAnalysisSwitchIsShown(): Promise<void> {
    await expect(this.labelChatAnalysisSwitch, 'The chat analysis switch came without its label').toHaveText(
      'Chat Analysis',
    );
    await expect(this.switchChatAnalysis, 'The page offers no way to turn chat analysis on or off').toBeVisible();
  }

  async enableAnalysis({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    if ((await this.switchChatAnalysis.getAttribute('data-state')) === 'checked') {
      return;
    }

    await this.switchChatAnalysis.click();
    await expect(this.switchChatAnalysis, 'The chat analysis switch stayed off after it was turned on').toHaveAttribute(
      'data-state',
      'checked',
      { timeout },
    );
  }

  async assertLabelSectionIsOffered({ title, placeholder, hint }: ChatAnalysisLabelSection): Promise<void> {
    const section = this.labelSection(title);

    await expect(section, `The page holds no "${title}" section`).toBeVisible();
    await expect(
      section.locator('.label-section__input'),
      `"${title}" came without the field it is entered in`,
    ).toHaveAttribute('placeholder', placeholder);
    await expect(section.locator('.label-section__add-button'), `"${title}" offers no way to add a value`).toHaveText(
      '+ Add',
    );
    await expect(section.locator('.label-section__hint'), `"${title}" came without its note`).toHaveText(hint);
  }

  async assertLabelSectionExplainsItself(
    { title }: ChatAnalysisLabelSection,
    { timeout = ACTION_TIMEOUT }: RouteReadyOptions = {},
  ): Promise<void> {
    await this.labelSection(title).locator('.label-section__input-wrapper .icon').hover();

    const tooltip = this.page.getByRole('tooltip').first();

    await expect(tooltip, `"${title}" offers no tooltip`).toBeVisible({ timeout });
    await expect(tooltip, `The tooltip of "${title}" explains nothing`).not.toBeEmpty();

    await this.page.keyboard.press('Escape');
    await expect(tooltip, `The tooltip of "${title}" stayed on screen`).toBeHidden({ timeout });
  }

  async addLabel({ title }: ChatAnalysisLabelSection, label: string): Promise<void> {
    const section = this.labelSection(title);

    await section.locator('.label-section__input').fill(label);
    await section.locator('.label-section__add-button').click();
  }

  async addLabelWithEnter({ title }: ChatAnalysisLabelSection, label: string): Promise<void> {
    const input = this.labelSection(title).locator('.label-section__input');

    await input.fill(label);
    await input.press('Enter');
  }

  async assertLabelIsShownAsChip({ title }: ChatAnalysisLabelSection, label: string): Promise<void> {
    const chip = this.labelChip(title, label);

    await expect(chip, `"${title}" does not list "${label}"`).toBeVisible();
    await expect(
      chip.locator('.label-section__chip-handle'),
      `"${label}" cannot be dragged into another position`,
    ).toHaveAttribute('draggable', 'true');
    await expect(
      chip.getByRole('button', { name: `Remove ${label}` }),
      `"${label}" is listed with no way to remove it`,
    ).toBeVisible();
  }

  async hasLabel({ title }: ChatAnalysisLabelSection, label: string): Promise<boolean> {
    return (await this.labelChip(title, label).count()) > 0;
  }

  async deleteLabel({ title }: ChatAnalysisLabelSection, label: string): Promise<void> {
    const chip = this.labelChip(title, label);

    await chip.getByRole('button', { name: `Remove ${label}` }).click();

    await expect(this.deleteDialog, `Removing "${label}" asked for no confirmation`).toBeVisible();
    await this.buttonConfirmDelete.click();

    await expect(chip, `"${title}" kept "${label}" after it was removed`).toHaveCount(0);
  }

  async saveSettings(): Promise<void> {
    await this.buttonSave.click();
  }

  async assertSaveWasConfirmed({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.toastList, 'Saving the chat analysis settings raised no notification').toContainText(
      'Chat analysis settings saved successfully',
      { timeout },
    );
  }

  async assertReorderingIsExplained({ title }: ChatAnalysisLabelSection): Promise<void> {
    await expect(
      this.labelSection(title).locator('.label-section__drag-hint'),
      `"${title}" lists labels without saying they can be reordered`,
    ).toHaveText('You can change the order of the labels by dragging them.');
  }

  private settingsLoaded({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<Response> {
    return this.page.waitForResponse(
      (response) => response.url().includes('configs/chat-analysis') && response.request().method() === 'GET',
      { timeout },
    );
  }

  private labelChip(title: string, label: string): Locator {
    return this.labelSection(title).locator('.label-section__chip').filter({ hasText: label });
  }

  private labelSection(title: string): Locator {
    return this.labelSections
      .filter({ has: this.page.locator('.label-section__header').getByText(title, { exact: true }) })
      .first();
  }
}
