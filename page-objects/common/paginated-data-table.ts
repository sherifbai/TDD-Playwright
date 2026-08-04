import { Locator, Page, expect } from '@playwright/test';

import { ExpectRowOptions, FindRowOptions, PaginatedDataTableOptions, RouteReadyOptions } from '@utils/interfaces';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class PaginatedDataTable {
  private readonly page: Page;
  private readonly table: Locator;
  private readonly rowLabelSelector: string;
  private readonly defaultPageSize: string;
  private readonly pageSizeSelect?: Locator;

  constructor(page: Page, options: PaginatedDataTableOptions) {
    this.page = page;
    this.table = options.table;
    this.rowLabelSelector = options.rowLabelSelector ?? 'td >> label';
    this.defaultPageSize = options.defaultPageSize ?? '50';
    this.pageSizeSelect = options.pageSizeSelect;
  }

  async waitUntilReady({ timeout = 15000 }: RouteReadyOptions = {}): Promise<void> {
    await expect(this.table).toBeVisible({ timeout });
    await expect(this.getRows().first(), 'Data table rendered its frame but never received rows').toBeVisible({
      timeout,
    });
  }

  getRows(): Locator {
    return this.table.locator('tbody tr');
  }

  getRowByText(text: string): Locator {
    const normalized = text.trim();
    const exactCellText = new RegExp(`^\\s*${escapeRegex(normalized)}\\s*$`);
    const rowText = new RegExp(`(^|\\s)${escapeRegex(normalized)}(\\s|$)`);

    return this.getRows()
      .filter({
        has: this.page.locator('td, [role="cell"]').filter({ hasText: exactCellText }).first(),
      })
      .or(this.getRows().filter({ hasText: rowText }));
  }

  async goToFirstPage(): Promise<void> {
    const firstPageButton = this.table.locator('button, a').filter({ hasText: /^1$/ }).first();

    if (await firstPageButton.isVisible().catch(() => false)) {
      await firstPageButton.click({ force: true }).catch(() => {});
      await this.waitUntilReady();
    }
  }

  async findRowAcrossPages(text: string, { maxPages = 10 }: FindRowOptions = {}): Promise<Locator> {
    await this.waitUntilReady();
    await this.goToFirstPage();

    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      const row = this.getRowByText(text);
      if (await row.count().catch(() => 0)) {
        return row.first();
      }

      const nextPageButton = this.table
        .locator('button, a')
        .filter({ hasText: /^(->|→|›|next)$/i })
        .last();

      const canAdvance =
        (await nextPageButton.isVisible().catch(() => false)) && (await nextPageButton.isEnabled().catch(() => false));

      if (!canAdvance) {
        break;
      }

      await nextPageButton.click({ force: true }).catch(() => {});
      await this.waitUntilReady();
    }

    return this.getRowByText(text).first();
  }

  async ensureRowsPerPage(pageSize: string = this.defaultPageSize): Promise<void> {
    if (!this.pageSizeSelect || (await this.pageSizeSelect.count()) === 0) {
      return;
    }

    const currentValue = await this.pageSizeSelect.inputValue().catch(() => null);
    let desiredValue = String(pageSize);

    const options = await this.pageSizeSelect
      .locator('option')
      .evaluateAll((nodes: HTMLOptionElement[]) =>
        nodes.map((node) => String(node.value || node.textContent || '').trim()).filter(Boolean),
      )
      .catch(() => [] as string[]);

    if (options.length && !options.includes(desiredValue)) {
      const numericOptions = options
        .map((value) => ({ value, numeric: Number.parseInt(value, 10) }))
        .filter((item) => Number.isFinite(item.numeric))
        .sort((a, b) => b.numeric - a.numeric);
      desiredValue = numericOptions[0]?.value || options[options.length - 1];
    }

    if (currentValue === desiredValue) {
      return;
    }

    const isNativeSelect = await this.pageSizeSelect
      .evaluate((el) => el.tagName?.toLowerCase() === 'select')
      .catch(() => false);
    if (!isNativeSelect) {
      return;
    }

    await this.pageSizeSelect.selectOption(desiredValue);
    await expect(this.pageSizeSelect).toHaveValue(desiredValue, { timeout: 15000 });
    await this.waitUntilReady();
  }

  async expectRowVisible(
    text: string,
    { pageSize = this.defaultPageSize, timeout = 15000 }: ExpectRowOptions = {},
  ): Promise<void> {
    await this.ensureRowsPerPage(pageSize);
    await expect(await this.findRowAcrossPages(text), `Row "${text}" should be visible in paginated table`).toBeVisible(
      { timeout },
    );
  }

  async expectRowDeleted(
    text: string,
    { pageSize = this.defaultPageSize, timeout = 15000 }: ExpectRowOptions = {},
  ): Promise<void> {
    await this.ensureRowsPerPage(pageSize);
    await this.findRowAcrossPages(text);
    await expect(this.getRowByText(text)).toHaveCount(0, { timeout });
  }

  getActionButton(row: Locator, actionName: string): Locator {
    return row.getByRole('button', { name: actionName, exact: true });
  }
}
