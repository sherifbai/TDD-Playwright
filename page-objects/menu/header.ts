import { Locator, Page, expect } from '@playwright/test';

export class Header {
  private readonly page: Page;

  private readonly logo: Locator;
  private readonly toggleSwitchStatus: Locator;
  private readonly inputStatusClarification: Locator;
  private readonly buttonStatusClarificationSave: Locator;
  private readonly buttonStatusClarificationCancel: Locator;
  private readonly buttonLogOut: Locator;

  constructor(page: Page) {
    this.page = page;

    this.logo = this.page.locator('svg').locator('g').first();
    this.toggleSwitchStatus = this.page.getByRole('switch');
    this.inputStatusClarification = this.page.getByLabel('Staatuse täpsustus');
    this.buttonStatusClarificationSave = this.page.locator('button').getByText('Salvesta');
    this.buttonStatusClarificationCancel = this.page.locator('button').getByText('Tühista');
    this.buttonLogOut = this.page.getByRole('button', { name: 'Logi välja', exact: true });

    // TODO: CSA menu mapping
  }

  async markCSAPresent(): Promise<void> {
    if ((await this.toggleSwitchStatus.getAttribute('data-state')) === 'unchecked') {
      await this.toggleSwitchStatus.click();
    }
  }

  async markCSAAway(): Promise<void> {
    if ((await this.toggleSwitchStatus.getAttribute('data-state')) === 'checked') {
      await this.toggleSwitchStatus.click();
    }
  }

  async assertLogoVisible(): Promise<void> {
    await expect(this.logo).toBeVisible();
  }

  async assertToggleSwitchVisible(): Promise<void> {
    await expect(this.toggleSwitchStatus).toBeVisible();
  }

  async assertLogoutButtonVisible(): Promise<void> {
    await expect(this.buttonLogOut).toBeVisible();
  }

  async saveCSAStatus(): Promise<void> {
    await this.inputStatusClarification.fill('CSA autotest');
    await this.buttonStatusClarificationSave.click();
  }
}
