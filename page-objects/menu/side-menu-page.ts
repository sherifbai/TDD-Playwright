import { Locator, Page, expect } from '@playwright/test';

export class SideMenuPage {
  private readonly page: Page;

  private readonly buttonConversations: Locator;
  private readonly buttonAnalytics: Locator;
  private readonly buttonServices: Locator;
  private readonly buttonAdministration: Locator;
  private readonly buttonCollapseAll: Locator;

  constructor(page: Page) {
    this.page = page;

    this.buttonConversations = this.page.getByRole('button', { name: 'Vestlused' });
    this.buttonAnalytics = this.page.getByRole('button', { name: 'Analüütika' });
    this.buttonServices = this.page.getByRole('button', { name: 'Teenused' });
    this.buttonAdministration = this.page.getByRole('button', { name: 'Haldus' });
    this.buttonCollapseAll = this.page.getByRole('button', { name: 'Kitsenda menüü' });
  }

  async isChatMenuVisible(): Promise<void> {
    await expect(this.buttonConversations).toBeVisible();
  }

  async assertVestlusedButtonVisible(): Promise<void> {
    await expect(this.buttonConversations).toBeVisible();
  }

  async assertAnalyytikaButtonVisible(): Promise<void> {
    await expect(this.buttonAnalytics).toBeVisible();
  }

  async assertTeenusedButtonVisible(): Promise<void> {
    await expect(this.buttonServices).toBeVisible();
  }

  async assertHaldusButtonVisible(): Promise<void> {
    await expect(this.buttonAdministration).toBeVisible();
  }

  async assertCollapseButtonVisible(): Promise<void> {
    await expect(this.buttonCollapseAll).toBeVisible();
  }
}
