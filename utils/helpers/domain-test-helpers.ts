import { Page, expect } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';
import { CSA_ACTIVITY_URL, WIDGET_DATA_URL } from '@utils/constants';
import { URLS } from '@utils/env';
import { CsaActivity } from '@utils/interfaces';

import { asUniqueNames } from './shared-helpers';

export async function customerWidgetName(page: Page): Promise<string> {
  const activity = (await (await page.request.get(CSA_ACTIVITY_URL)).json()) as { response: CsaActivity };

  const response = await page.request.get(`${WIDGET_DATA_URL}?user_id=${activity.response.idCode}`);
  const widgets = (await response.json()) as { name: string; url: string }[];
  const widget = widgets.find((candidate) => candidate.url === URLS.customer);

  expect(widget, `The back office configures no widget for ${URLS.customer}`).toBeTruthy();

  return (widget as { name: string }).name;
}

type DomainNames = string | string[];
type DomainNamesResolver = DomainNames | (() => DomainNames | Promise<DomainNames>);

export function domainCleanup(resolveNames: DomainNamesResolver) {
  return async ({ page }: { page: Page }): Promise<void> => {
    const names = asUniqueNames(typeof resolveNames === 'function' ? await resolveNames() : resolveNames);

    if (!names.length) {
      return;
    }

    const mdp = new AdminPageFactory(page).getMultiDomainsPage();

    await mdp.open();

    let removedAny = false;

    for (const name of names) {
      if (await mdp.hasDomain(name)) {
        await mdp.deleteDomainByName(name);
        removedAny = true;
      }
    }

    if (removedAny) {
      await mdp.saveDomains();
      await mdp.assertSaveWasConfirmed();
    }
  };
}
