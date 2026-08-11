import { APIResponse, Page, expect } from '@playwright/test';

import { CSA_ACTIVITY_URL, ORGANIZATION_WORKING_TIME_URL, WIDGET_DATA_URL } from '@utils/constants';
import { URLS } from '@utils/env';
import { CsaActivity } from '@utils/interfaces';

/** Administration -> Office opening hours, where the texts the bot falls back on are edited. */
export class OfficeHoursPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * The notice the widget shows instead of offering an operator. It is a free-text field an
   * administrator may rewrite in any language, so tests have to read it rather than assume it.
   */
  async noCsaAvailableMessage(): Promise<string> {
    const response = await this.read(`${ORGANIZATION_WORKING_TIME_URL}?domain=${await this.widgetId()}`);
    const { response: settings } = (await response.json()) as {
      response: { organizationNoCsaAvailableMessage: string };
    };

    expect(
      settings.organizationNoCsaAvailableMessage,
      'The back office holds no notice for the case where no operator is available',
    ).toBeTruthy();

    return settings.organizationNoCsaAvailableMessage;
  }

  /** Every widget carries its own texts, and the settings endpoint asks for one of them by id. */
  private async widgetId(): Promise<string> {
    const response = await this.read(`${WIDGET_DATA_URL}?user_id=${await this.idCode()}`);
    const widgets = (await response.json()) as { id: string; url: string }[];
    const widget = widgets.find((candidate) => candidate.url === URLS.customer);

    expect(widget, `The back office configures no widget for ${URLS.customer}`).toBeTruthy();

    return (widget as { id: string }).id;
  }

  private async idCode(): Promise<string> {
    const response = await this.read(CSA_ACTIVITY_URL);
    const { response: activity } = (await response.json()) as { response: CsaActivity };

    return activity.idCode;
  }

  private async read(url: string): Promise<APIResponse> {
    const response = await this.page.request.get(url);

    expect(response.ok(), `The back office would not answer ${url} (${response.status()})`).toBeTruthy();

    return response;
  }
}
