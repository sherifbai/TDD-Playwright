import { UnansweredChatsPage } from '@page-objects/chats';
import { PageHeader, SideMenuPage } from '@page-objects/menu';
import { ServicePage, ServicesOverviewPage } from '@page-objects/services';
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
