import { Locator, Page, expect } from '@playwright/test';

import { URLS } from '@utils/env';
import { RouteReadyOptions } from '@utils/interfaces';
import { waitForSessionLengthReady } from '@utils/waits';

export class SessionLengthPage {
  private readonly page: Page;

  private readonly headingSessionLength: Locator;
  private readonly textInactiveUsersLoggedOut: Locator;
  private readonly textConversationEndsAutomatically: Locator;

  private readonly inputSessionLength: Locator;
  private readonly inputResponseTime: Locator;

  private readonly labelSessionLengthUnit: Locator;
  private readonly labelResponseTimeUnit: Locator;

  private readonly noteSessionLengthRange: Locator;
  private readonly noteResponseTimeRange: Locator;

  private readonly switchDisplayMessage: Locator;
  private readonly switchShowEndMessage: Locator;

  private readonly textareaIdleWarningMessage: Locator;
  private readonly textareaEndMessage: Locator;

  private readonly buttonSave: Locator;

  constructor(page: Page) {
    this.page = page;

    this.headingSessionLength = this.page.getByRole('heading', { name: 'Session length', exact: true });
    this.textInactiveUsersLoggedOut = this.page.getByText(
      'User session length, after which inactive users are logged out.',
      { exact: true },
    );
    this.textConversationEndsAutomatically = this.page.getByText(
      'When the time expires, the conversation will end automatically.',
      { exact: true },
    );

    this.inputSessionLength = this.page.locator('input[name="session-length"]');
    this.inputResponseTime = this.page.locator('input[name="chatActiveDuration"]');

    this.labelSessionLengthUnit = this.page.locator('label.minute').filter({ hasText: /^Minutes$/ });
    this.labelResponseTimeUnit = this.page.locator('label.minute').filter({ hasText: /^minutes$/ });

    this.noteSessionLengthRange = this.page.getByText('Session length is allowed between 30 min - 480 min (8h)', {
      exact: true,
    });
    this.noteResponseTimeRange = this.page.getByText('Session length is allowed between 5 min - 480 min (8h)', {
      exact: true,
    });

    this.switchDisplayMessage = this.page.getByRole('switch', { name: 'Display message' });
    this.switchShowEndMessage = this.page.getByRole('switch', { name: 'Show end message' });

    this.textareaIdleWarningMessage = this.page.getByLabel('Idle warning message', { exact: true });
    this.textareaEndMessage = this.page.getByLabel('End message', { exact: true });

    this.buttonSave = this.page.getByRole('button', { name: 'Save', exact: true });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForSessionLengthReady(this.page, options);
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/session-length');
    await this.waitForReady();
  }

  async assertPageIsShown(): Promise<void> {
    await expect(this.headingSessionLength, 'Session length never rendered its heading').toBeVisible();
    await expect(
      this.textInactiveUsersLoggedOut,
      'The page never explained what the session length applies to',
    ).toBeVisible();
    await expect(
      this.textConversationEndsAutomatically,
      'The page never explained what happens once the time expires',
    ).toBeVisible();
    await expect(this.buttonSave, 'The page offers no way to save the session length').toBeVisible();
  }

  async assertSessionLengthFieldIsShown(): Promise<void> {
    await expect(this.inputSessionLength, 'The page holds no session length field').toBeVisible();
    await expect(this.labelSessionLengthUnit, 'The session length field states no unit').toBeVisible();
    await expect(this.noteSessionLengthRange, 'The session length field states no allowed range').toBeVisible();
    await this.assertTooltipIsOffered(this.inputSessionLength, 'session length field');
  }

  async assertResponseTimeFieldIsShown(): Promise<void> {
    await expect(this.inputResponseTime, 'The page holds no field for the time a user has to respond').toBeVisible();
    await expect(this.labelResponseTimeUnit, 'The response time field states no unit').toBeVisible();
    await expect(this.noteResponseTimeRange, 'The response time field states no allowed range').toBeVisible();
    await this.assertTooltipIsOffered(this.inputResponseTime, 'response time field');
  }

  async assertMessageTogglesAreShown(): Promise<void> {
    await expect(this.switchDisplayMessage, 'The page offers no toggle for the idle warning message').toBeVisible();
    await expect(this.switchShowEndMessage, 'The page offers no toggle for the end message').toBeVisible();

    await this.assertTooltipIsOffered(this.switchDisplayMessage, '"Display message" toggle');
    await this.assertTooltipIsOffered(this.switchShowEndMessage, '"Show end message" toggle');
  }

  async assertIdleWarningMessageFollowsItsToggle(): Promise<void> {
    await this.assertMessageFieldFollowsItsToggle(
      this.switchDisplayMessage,
      this.textareaIdleWarningMessage,
      'idle warning message',
    );
  }

  async assertEndMessageFollowsItsToggle(): Promise<void> {
    await this.assertMessageFieldFollowsItsToggle(this.switchShowEndMessage, this.textareaEndMessage, 'end message');
  }

  private async assertMessageFieldFollowsItsToggle(
    toggle: Locator,
    field: Locator,
    describedAs: string,
  ): Promise<void> {
    await this.setSwitch(toggle, true);

    await expect(field, `The ${describedAs} is missing while its toggle says Yes`).toBeVisible();
    await expect(field, `The ${describedAs} takes more than the 500 characters allowed`).toHaveAttribute(
      'maxlength',
      '500',
    );
    await this.assertTooltipIsOffered(field, describedAs);

    await this.setSwitch(toggle, false);
    await expect(field, `The ${describedAs} stayed on the page while its toggle says No`).toBeHidden();
  }

  private async setSwitch(toggle: Locator, on: boolean): Promise<void> {
    if ((await toggle.getAttribute('aria-checked')) !== String(on)) {
      await toggle.click();
    }

    await expect(toggle, 'The toggle kept the state it was clicked out of').toHaveAttribute('aria-checked', String(on));
  }

  private async assertTooltipIsOffered(control: Locator, describedAs: string): Promise<void> {
    const trigger = this.page
      .locator('main .switch, main .track')
      .filter({ has: control })
      .last()
      .locator('span[data-state="closed"]')
      .first();

    await trigger.hover();
    await expect(this.page.getByRole('tooltip'), `The ${describedAs} carries no tooltip`).toBeVisible();
  }
}
