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
    this.inputStatusClarification = this.page.getByLabel('Status clarification');
    this.buttonStatusClarificationSave = this.page.locator('button').getByText('Save');
    this.buttonStatusClarificationCancel = this.page.locator('button').getByText('Cancel');
    this.buttonLogOut = this.page.getByRole('button', { name: 'Logout', exact: true });

    // TODO: CSA menu mapping
  }

  async markCSAPresent(): Promise<void> {
    await this.setCSAStatus('online');
  }

  // Leaves the account deactivated: the back office then renders no header at all on
  // the next load, so presence cannot be restored through the UI and every later test
  // sharing this account needs a fresh login. Only call it if the test restores presence.
  async markCSAAway(): Promise<void> {
    await this.setCSAStatus('offline');
  }

  // The switch renders from the account's `active` flag, not from its status, so
  // `data-state` reads `checked` while the account still sits on `idle` and the bot
  // answers an escalation with "Nõustaja on eemal" instead of offering an agent.
  // Flip the switch away from the target state, then flip it back, and take the
  // status POST the admin itself sends as the proof of what the server now holds.
  private async setCSAStatus(status: 'online' | 'offline'): Promise<void> {
    const targetState = status === 'online' ? 'checked' : 'unchecked';
    const oppositeState = status === 'online' ? 'unchecked' : 'checked';

    await expect(this.toggleSwitchStatus).toBeVisible({ timeout: 30000 });

    if ((await this.toggleSwitchStatus.getAttribute('data-state')) !== oppositeState) {
      await this.toggleSwitchStatus.click();
      await expect(this.toggleSwitchStatus).toHaveAttribute('data-state', oppositeState, { timeout: 15000 });
    }

    const statusPosted = this.page.waitForResponse(
      (response) =>
        response.url().includes('accounts/customer-support-activity') &&
        response.request().method() === 'POST' &&
        (response.request().postData() ?? '').includes(`"customerSupportStatus":"${status}"`),
      { timeout: 15000 },
    );

    await this.toggleSwitchStatus.click();

    const response = await statusPosted;
    expect(response.ok(), `The admin rejected the switch to "${status}" with ${response.status()}`).toBeTruthy();
    await expect(this.toggleSwitchStatus).toHaveAttribute('data-state', targetState, { timeout: 15000 });
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
