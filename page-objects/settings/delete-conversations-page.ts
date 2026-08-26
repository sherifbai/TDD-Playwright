import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT } from '@utils/constants';
import { URLS } from '@utils/env';
import { RouteReadyOptions } from '@utils/interfaces';
import { waitForDeleteConversationsReady } from '@utils/waits';

const EXPIRING_CONVERSATION_COLUMNS = [
  'Start time',
  'End time',
  'Customer support name',
  'Name',
  'ID code',
  'Contact',
  'Comment',
  'Rating',
  'Feedback',
  'Status',
  'ID',
];

const RESULT_COUNT_OPTIONS = ['10', '20', '30', '40', '50'];

const DATE_RANGE_SHORTCUTS = ['1 day', '7 days', '31 day', '90 days'];

export class DeleteConversationsPage {
  private readonly page: Page;

  private readonly headingPage: Locator;
  private readonly textRules: Locator;

  private readonly switchAuthenticatedRemoval: Locator;
  private readonly switchAnonymousRemoval: Locator;
  private readonly tooltipsRemoval: Locator;

  private readonly inputAuthenticatedPeriod: Locator;
  private readonly inputAnonymousPeriod: Locator;
  private readonly labelsDays: Locator;
  private readonly noteAuthenticated: Locator;
  private readonly noteAnonymous: Locator;

  private readonly inputDeletionTime: Locator;
  private readonly tooltipDeletionTime: Locator;

  private readonly labelExpiringRange: Locator;
  private readonly inputRangeFrom: Locator;
  private readonly inputRangeUntil: Locator;
  private readonly tooltipExpiringRange: Locator;

  private readonly textConversationsInPeriod: Locator;

  private readonly triggerColumnSelector: Locator;
  private readonly optionsColumnSelector: Locator;

  private readonly table: Locator;
  private readonly tableSortButtons: Locator;
  private readonly tableRows: Locator;

  private readonly paginationNav: Locator;
  private readonly selectResultCount: Locator;

  private readonly buttonSave: Locator;

  constructor(page: Page) {
    this.page = page;

    this.headingPage = this.page.getByRole('heading', { name: 'Conversation deletion', exact: true });
    this.textRules = this.page.getByText('Automatic expiration and deletion rules', { exact: true });

    this.switchAuthenticatedRemoval = this.page.getByRole('switch', { name: 'Authenticated conversations removal' });
    this.switchAnonymousRemoval = this.page.getByRole('switch', { name: 'Anonymous conversations removal' });
    this.tooltipsRemoval = this.page.locator('main .switch__tooltip');

    this.inputAuthenticatedPeriod = this.page.locator('main input[name="authPeriod"]');
    this.inputAnonymousPeriod = this.page.locator('main input[name="anonymPeriod"]');
    this.labelsDays = this.page.locator('main label.minute');
    this.noteAuthenticated = this.page.getByText(
      'Defines the time after which authenticated messages are automatically deleted.',
      { exact: true },
    );
    this.noteAnonymous = this.page.getByText(
      'Defines the time after which anonymous messages are automatically deleted.',
      { exact: true },
    );

    this.inputDeletionTime = this.page.locator('main .datepicker:not(.startTime *):not(.endTime *) input');
    this.tooltipDeletionTime = this.page
      .locator('div.track')
      .filter({ hasText: 'Deletion time' })
      .filter({ has: this.page.locator('.datepicker') })
      .locator('span[data-state]')
      .first();

    this.labelExpiringRange = this.page.getByText('Show expiring conversations', { exact: true });
    this.inputRangeFrom = this.page.locator('main .startTime input');
    this.inputRangeUntil = this.page.locator('main .endTime input');
    this.tooltipExpiringRange = this.page
      .locator('div.track')
      .filter({ has: this.buttonRangeShortcut(DATE_RANGE_SHORTCUTS[0]) })
      .last()
      .locator('span[data-state]')
      .first();

    this.textConversationsInPeriod = this.page.locator('main').getByText('Conversations in period');

    this.triggerColumnSelector = this.page.locator('main .select__trigger');
    this.optionsColumnSelector = this.page.locator('main .select__menu li');

    this.table = this.page.locator('main table.data-table');
    this.tableSortButtons = this.table.locator('thead th button');
    this.tableRows = this.table.locator('tbody tr');

    this.paginationNav = this.page.getByRole('navigation', { name: 'Pagination navigation' });
    this.selectResultCount = this.page.locator('main .data-table__page-size select');

    this.buttonSave = this.page.getByRole('button', { name: 'Save', exact: true });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForDeleteConversationsReady(this.page, options);
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/delete-conversations');
    await this.waitForReady();
  }

  private buttonRangeShortcut(caption: string): Locator {
    return this.page.getByRole('button', { name: caption, exact: true });
  }

  async assertPageNamesItself(): Promise<void> {
    await expect(this.headingPage, 'The page does not name itself').toBeVisible();
    await expect(this.textRules, 'The page does not say what the rules below it do').toBeVisible();
  }

  async assertRemovalTogglesOffered(): Promise<void> {
    await expect(this.switchAuthenticatedRemoval, 'Authenticated conversations cannot be switched off').toBeVisible();
    await expect(this.switchAnonymousRemoval, 'Anonymous conversations cannot be switched off').toBeVisible();
    await expect(this.tooltipsRemoval, 'A removal toggle was offered without its tooltip').toHaveCount(2);
    await expect(this.tooltipsRemoval.first(), 'The tooltip of a removal toggle never became visible').toBeVisible();
  }

  async assertSaveOffered(): Promise<void> {
    await expect(this.buttonSave, 'The rules cannot be saved').toBeVisible();
  }

  async setAuthenticatedRemoval(on: boolean): Promise<void> {
    await this.setRemoval(this.switchAuthenticatedRemoval, on, 'authenticated');
  }

  async setAnonymousRemoval(on: boolean): Promise<void> {
    await this.setRemoval(this.switchAnonymousRemoval, on, 'anonymous');
  }

  private async setRemoval(toggle: Locator, on: boolean, describedAs: string): Promise<void> {
    const wanted = String(on);

    if ((await toggle.getAttribute('aria-checked')) !== wanted) {
      await toggle.click();
    }

    await expect(toggle, `The ${describedAs} removal toggle would not move to "${on ? 'Yes' : 'No'}"`).toHaveAttribute(
      'aria-checked',
      wanted,
    );
  }

  async assertPeriodFieldsOffered(): Promise<void> {
    for (const [period, describedAs] of [
      [this.inputAuthenticatedPeriod, 'authenticated'],
      [this.inputAnonymousPeriod, 'anonymous'],
    ] as [Locator, string][]) {
      await expect(period, `${describedAs} removal asks for no period`).toBeVisible();
      await expect(period, `The period of ${describedAs} removal is not a number field`).toHaveAttribute(
        'type',
        'number',
      );
    }

    await expect(this.labelsDays, 'A period field was offered without the unit it counts in').toHaveText([
      'days',
      'days',
    ]);
    await expect(this.noteAuthenticated, 'Authenticated removal explains nothing about what it deletes').toBeVisible();
    await expect(this.noteAnonymous, 'Anonymous removal explains nothing about what it deletes').toBeVisible();
  }

  async assertDeletionTimeOffered(): Promise<void> {
    await expect(this.inputDeletionTime, 'The hour the deletion runs at cannot be set').toBeVisible();
    await expect(this.tooltipDeletionTime, 'The deletion time was offered without its tooltip').toBeVisible();
  }

  async assertExpiringRangeOffered(): Promise<void> {
    await expect(this.labelExpiringRange, 'The expiring conversations filter is not named').toBeVisible();
    await expect(this.inputRangeFrom, 'The expiring conversations filter takes no date to start from').toBeVisible();
    await expect(this.inputRangeUntil, 'The expiring conversations filter takes no date to end at').toBeVisible();
    await expect(this.tooltipExpiringRange, 'The expiring conversations filter carries no tooltip').toBeVisible();

    for (const shortcut of DATE_RANGE_SHORTCUTS) {
      await expect(this.buttonRangeShortcut(shortcut), `The filter offers no "${shortcut}" shortcut`).toBeVisible();
    }
  }

  async assertConversationCountShown(): Promise<void> {
    await expect(this.textConversationsInPeriod, 'The page counts no conversations for the period').toBeVisible();
  }

  async assertColumnSelectorOffersEveryColumn(): Promise<void> {
    await expect(this.triggerColumnSelector, 'The column selector lost its placeholder').toContainText('Choose');

    await this.triggerColumnSelector.click();
    await expect(
      this.optionsColumnSelector,
      'The column selector offers a different set of columns than the table lists',
    ).toHaveText(EXPIRING_CONVERSATION_COLUMNS);

    await this.triggerColumnSelector.click();
    await expect(this.triggerColumnSelector, 'The column selector stayed open').toHaveAttribute(
      'aria-expanded',
      'false',
    );
  }

  async loadNinetyDayRange(): Promise<void> {
    await this.buttonRangeShortcut('90 days').click();
    await expect(
      this.tableRows.first(),
      'No conversation expires within ninety days, so the table has nothing to list',
    ).toBeVisible({ timeout: ACTION_TIMEOUT });
  }

  async assertTableListsEveryColumnWithSorting(): Promise<void> {
    await expect(this.table, 'The expiring conversations table is not on the page').toBeVisible();

    for (const column of EXPIRING_CONVERSATION_COLUMNS) {
      await expect(
        this.table.getByRole('columnheader', { name: column, exact: true }),
        `The table lists no "${column}" column`,
      ).toBeVisible();
    }

    await expect(this.tableSortButtons, 'A column was listed with no way to sort by it').toHaveCount(
      EXPIRING_CONVERSATION_COLUMNS.length,
    );
  }

  async assertEveryRowEndsWithView(): Promise<void> {
    const rows = await this.tableRows.count();

    expect(rows, 'The expiring conversations table stayed empty').toBeGreaterThan(0);
    await expect(
      this.table.getByRole('button', { name: 'View', exact: true }),
      'A conversation was listed with no way to open it',
    ).toHaveCount(rows);
  }

  async assertPagingOfferedWhenListOverflows(): Promise<void> {
    const pageSize = Number(await this.selectResultCount.inputValue());
    const rows = await this.tableRows.count();

    expect(rows, 'The expiring conversations table stayed empty').toBeGreaterThan(0);

    if (rows < pageSize) {
      return;
    }

    await expect(this.paginationNav, 'The list filled its page but was offered no way to turn it').toBeVisible();
  }

  async assertResultCountOffered(): Promise<void> {
    await expect(this.selectResultCount, 'The table offers no choice of how many rows to show').toBeVisible();
    await expect(this.selectResultCount, 'The result count does not start on the page size the case names').toHaveValue(
      RESULT_COUNT_OPTIONS[0],
    );
    await expect(
      this.selectResultCount.locator('option'),
      'The result count offers a different set of page sizes',
    ).toHaveText(RESULT_COUNT_OPTIONS);
  }

  async assertAuthenticatedPeriodHidden(): Promise<void> {
    await expect(
      this.inputAuthenticatedPeriod,
      'Authenticated removal was switched off but still asks for a period',
    ).toHaveCount(0);
    await expect(this.noteAuthenticated, 'The note of a switched off removal stayed on the page').toHaveCount(0);
  }

  async assertAnonymousPeriodHidden(): Promise<void> {
    await expect(
      this.inputAnonymousPeriod,
      'Anonymous removal was switched off but still asks for a period',
    ).toHaveCount(0);
    await expect(this.noteAnonymous, 'The note of a switched off removal stayed on the page').toHaveCount(0);
  }

  async assertExpiringBlockHidden(): Promise<void> {
    await expect(this.inputDeletionTime, 'Nothing is deleted any more, yet the deletion time stayed').toHaveCount(0);
    await expect(this.labelExpiringRange, 'Nothing expires any more, yet the filter stayed').toHaveCount(0);
    await expect(this.textConversationsInPeriod, 'Nothing expires any more, yet the count stayed').toHaveCount(0);
    await expect(this.table, 'Nothing expires any more, yet the table stayed').toHaveCount(0);
    await expect(this.paginationNav, 'Nothing expires any more, yet the paging stayed').toHaveCount(0);
  }
}
