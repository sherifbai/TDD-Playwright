import { Locator, Page, expect } from '@playwright/test';

import { ANONYMIZER_APPROACHES, ANONYMIZER_ENTITIES } from '@utils/constants';
import { URLS } from '@utils/env';
import { RouteReadyOptions } from '@utils/interfaces';
import { waitForAnonymizerReady } from '@utils/waits';

export class AnonymizerPage {
  private readonly page: Page;

  private readonly headingSettings: Locator;
  private readonly headingTesting: Locator;
  private readonly headingEntities: Locator;
  private readonly headingAllowlist: Locator;
  private readonly headingDenylist: Locator;

  private readonly domainTabs: Locator;
  private readonly domainTabsActive: Locator;
  private readonly buttonCopyToDomain: Locator;

  private readonly selectApproach: Locator;
  private readonly approachOptions: Locator;

  private readonly entityCheckboxes: Locator;

  private readonly inputAllowlist: Locator;
  private readonly inputDenylist: Locator;

  private readonly rowAnonymizationBeforeLlm: Locator;
  private readonly rowRecordAnonymously: Locator;
  private readonly switchAnonymizationBeforeLlm: Locator;
  private readonly switchRecordAnonymously: Locator;

  private readonly buttonSaveSettings: Locator;

  private readonly textareaInputText: Locator;
  private readonly textareaOutputText: Locator;
  private readonly buttonClear: Locator;
  private readonly buttonAnonymize: Locator;

  constructor(page: Page) {
    this.page = page;

    const switchRow = (label: string): Locator =>
      this.page.locator('main div.track:has(> div.icon-switch)').filter({ hasText: label });

    this.headingSettings = this.page.getByRole('heading', { name: 'Anonymizer Settings', exact: true });
    this.headingTesting = this.page.getByRole('heading', { name: 'Anonymizer Testing', exact: true });
    this.headingEntities = this.page.getByRole('heading', { name: 'Entities to anonymize', exact: true });
    this.headingAllowlist = this.page.getByRole('heading', { name: 'Add words to the allowlist', exact: true });
    this.headingDenylist = this.page.getByRole('heading', { name: 'Add words to the denylist', exact: true });

    this.domainTabs = this.page.locator('main .domain-tab-selector__tab');
    this.domainTabsActive = this.page.locator('main .domain-tab-selector__tab--active');
    this.buttonCopyToDomain = this.page.getByRole('button', { name: 'Copy to domain', exact: true });

    this.selectApproach = this.page.getByRole('combobox').first();
    this.approachOptions = this.page.getByRole('option');

    this.entityCheckboxes = this.page.locator('main input[type="checkbox"]');

    this.inputAllowlist = this.page.getByPlaceholder('Enter a word and press Enter to add to the allowlist');
    this.inputDenylist = this.page.getByPlaceholder('Enter a word and press Enter to add to the denylist');

    this.rowAnonymizationBeforeLlm = switchRow('Anonymization before LLM');
    this.rowRecordAnonymously = switchRow('Record conversations anonymously');
    this.switchAnonymizationBeforeLlm = this.rowAnonymizationBeforeLlm.getByRole('switch');
    this.switchRecordAnonymously = this.rowRecordAnonymously.getByRole('switch');

    this.buttonSaveSettings = this.page.getByRole('button', { name: 'Save Settings', exact: true });

    this.textareaInputText = this.page.getByPlaceholder('Enter text to be anonymized');
    this.textareaOutputText = this.page.getByPlaceholder('Anonymized text will appear here');
    this.buttonClear = this.page.getByRole('button', { name: 'Clear', exact: true });
    this.buttonAnonymize = this.page.getByRole('button', { name: 'Anonymize', exact: true });
  }

  async waitForReady(options: RouteReadyOptions = {}): Promise<void> {
    await waitForAnonymizerReady(this.page, options);
  }

  async open(): Promise<void> {
    await this.page.goto(URLS.admin + 'chat/anonymizer');
    await this.waitForReady();
  }

  async assertSettingsCardIsShown(): Promise<void> {
    await expect(this.headingSettings, 'The anonymizer never rendered its settings heading').toBeVisible();
    await expect(this.buttonCopyToDomain, 'The settings offer no way to copy them to another domain').toBeVisible();
  }

  async assertDomainTabsAreShown(): Promise<void> {
    await expect(this.domainTabs.first(), 'The settings are offered for no domain at all').toBeVisible();
    await expect(this.domainTabsActive, 'The domain tabs single out no domain as the one being edited').toHaveCount(1);
  }

  async assertApproachOptionsAreOffered(): Promise<void> {
    await expect(this.selectApproach, 'The settings hold no anonymization approach dropdown').toBeVisible();

    await this.selectApproach.click();
    await expect(
      this.approachOptions,
      'The anonymization approach dropdown offers a different set of options',
    ).toHaveText([...ANONYMIZER_APPROACHES]);

    await this.page.keyboard.press('Escape');
  }

  async assertEntitiesAreOffered(): Promise<void> {
    await expect(this.headingEntities, 'The settings hold no entities section').toBeVisible();
    await expect(this.entityCheckboxes, 'The entities section lists a different number of entities').toHaveCount(
      ANONYMIZER_ENTITIES.length,
    );

    for (const entity of ANONYMIZER_ENTITIES) {
      await expect(this.entityCheckbox(entity), `The entities section offers no "${entity}" checkbox`).toBeVisible();
    }
  }

  async assertWordListsAreOffered(): Promise<void> {
    await expect(this.headingAllowlist, 'The settings hold no allowlist section').toBeVisible();
    await expect(this.inputAllowlist, 'The allowlist section takes no word').toBeVisible();

    await expect(this.headingDenylist, 'The settings hold no denylist section').toBeVisible();
    await expect(this.inputDenylist, 'The denylist section takes no word').toBeVisible();
  }

  async assertTogglesAreShown(): Promise<void> {
    await expect(
      this.switchAnonymizationBeforeLlm,
      'The settings offer no toggle for anonymization before the LLM',
    ).toBeVisible();
    await expect(
      this.switchRecordAnonymously,
      'The settings offer no toggle for recording conversations anonymously',
    ).toBeVisible();

    await this.assertTooltipIsOffered(this.rowRecordAnonymously, '"Record conversations anonymously" toggle');
  }

  async assertSettingsAreSaveable(): Promise<void> {
    await expect(this.buttonSaveSettings, 'The page offers no way to save the anonymizer settings').toBeVisible();
  }

  async assertTestingCardIsShown(): Promise<void> {
    await expect(this.headingTesting, 'The page holds no anonymizer testing card').toBeVisible();
    await expect(this.textareaInputText, 'The testing card takes no text to anonymize').toBeVisible();
    await expect(this.buttonClear, 'The testing card offers no way to clear the text entered').toBeVisible();
    await expect(this.buttonAnonymize, 'The testing card offers no way to anonymize the text entered').toBeVisible();
    await expect(this.textareaOutputText, 'The testing card shows no anonymized text back').toBeVisible();
  }

  private entityCheckbox(entity: string): Locator {
    return this.page.locator(`main input[type="checkbox"][name="${entity}"]`);
  }

  private async assertTooltipIsOffered(row: Locator, describedAs: string): Promise<void> {
    await row.locator('span[data-state="closed"]').first().hover();
    await expect(this.page.getByRole('tooltip'), `The ${describedAs} carries no tooltip`).toBeVisible();
  }
}
