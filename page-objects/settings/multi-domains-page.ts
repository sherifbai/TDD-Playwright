import { Locator, Page, expect } from '@playwright/test';

import { ACTION_TIMEOUT } from '@utils/constants';
import { RouteReadyOptions } from '@utils/interfaces';
import { waitForMultiDomainsReady } from '@utils/waits';

export class MultiDomainsPage {
  private readonly page: Page;

  private readonly inputsDomainName: Locator;
  private readonly inputsDomainUrl: Locator;

  private readonly buttonsDeleteDomain: Locator;
  private readonly buttonAddNew: Locator;

  constructor(page: Page) {
    this.page = page;

    this.inputsDomainName = this.page.locator('main input[name^="widgetDomains."][name$=".name"]');
    this.inputsDomainUrl = this.page.locator('main input[name^="widgetDomains."][name$=".url"]');

    this.buttonsDeleteDomain = this.page.locator('main button.btn--error');

    this.buttonAddNew = this.page.getByRole('button', { name: 'Add new', exact: true });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForMultiDomainsReady(this.page, options);
  }

  async domainRowCount({ timeout = ACTION_TIMEOUT }: RouteReadyOptions = {}): Promise<number> {
    await expect(
      this.inputsDomainName.first(),
      'Multidomains rendered its heading but never received a domain row',
    ).toBeVisible({ timeout });

    return this.inputsDomainName.count();
  }

  async assertRowsAreComplete(): Promise<void> {
    const rows = await this.domainRowCount();

    expect(rows, 'The page lists no domain at all').toBeGreaterThan(0);
    await expect(this.inputsDomainUrl, 'A domain was listed without its URL field').toHaveCount(rows);
    await expect(this.buttonsDeleteDomain, 'A domain was listed with no way to remove it').toHaveCount(rows);
    await expect(this.buttonsDeleteDomain.first(), 'The delete control never became visible').toBeVisible();
  }

  async assertOnlyDomainCannotBeDeleted(): Promise<void> {
    await expect(this.inputsDomainName, 'The form was expected to hold a single domain').toHaveCount(1);
    await expect(
      this.buttonsDeleteDomain.first(),
      'The last domain left was still offered for deletion',
    ).toBeDisabled();
  }

  async addDomainRow(): Promise<void> {
    const rowsBefore = await this.domainRowCount();

    await this.buttonAddNew.click();
    await expect(this.inputsDomainName, 'The page never added the domain row it was asked for').toHaveCount(
      rowsBefore + 1,
    );
  }

  async removeDomainRowsUntilOneLeft(): Promise<void> {
    for (let rows = await this.domainRowCount(); rows > 1; rows--) {
      await this.buttonsDeleteDomain.last().click();
      await expect(this.inputsDomainName, 'The form kept the domain row that was removed').toHaveCount(rows - 1);
    }
  }
}
