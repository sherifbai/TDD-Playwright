import { ActiveChatsPage, UnansweredChatsPage } from '@page-objects/chats';
import { Header, SideMenu } from '@page-objects/menu';
import { NewServicePage, ServicesOverviewPage } from '@page-objects/services';
import { Page } from '@playwright/test';

export class AdminPageFactory {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  getPageHeader(): Header {
    return new Header(this.page);
  }

  getSideMenu(): SideMenu {
    return new SideMenu(this.page);
  }

  getUnansweredChats(): UnansweredChatsPage {
    return new UnansweredChatsPage(this.page);
  }

  getActiveChats(): ActiveChatsPage {
    return new ActiveChatsPage(this.page);
  }

  getServicesOverview(): ServicesOverviewPage {
    return new ServicesOverviewPage(this.page);
  }

  getNewServicePage(): NewServicePage {
    return new NewServicePage(this.page);
  }
}
