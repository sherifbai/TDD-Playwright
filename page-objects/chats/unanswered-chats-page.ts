import { Locator, Page } from '@playwright/test';

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
}
