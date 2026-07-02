import { UnansweredChatsPage } from '@page-objects/chats/chats-page';
import { PageHeader } from '@page-objects/menu/page-header';
import { SideMenuPage } from '@page-objects/menu/side-menu-page';
import { ServicePage } from '@page-objects/services/newservice/service-page';
import { ServicesOverviewPage } from '@page-objects/services/overview/services-overview-page';
import { Page } from '@playwright/test';

export class AdminPageFactory {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  getPageHeader(): PageHeader {
    return new PageHeader(this.page);
  }

  getSideMenu(): SideMenuPage {
    return new SideMenuPage(this.page);
  }

  getChats(): UnansweredChatsPage {
    return new UnansweredChatsPage(this.page);
  }

  getServicesOverview(): ServicesOverviewPage {
    return new ServicesOverviewPage(this.page);
  }

  getNewServicePage(): ServicePage {
    return new ServicePage(this.page);
  }
}
