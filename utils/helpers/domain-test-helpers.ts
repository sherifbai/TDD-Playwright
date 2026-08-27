import { Page } from '@playwright/test';

import { AdminPageFactory } from '@page-objects/admin-page-factory';

import { asUniqueNames } from './shared-helpers';

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
