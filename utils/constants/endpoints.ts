import { URLS } from '@utils/env';

/** The back office's own status endpoint: read with GET, written with POST by the header switch. */
export const CSA_ACTIVITY_PATH = 'accounts/customer-support-activity';

export const CSA_ACTIVITY_URL = `${URLS.api}v2/private/backoffice/${CSA_ACTIVITY_PATH}`;

/** The widgets this account may configure. Asks for the account by `user_id`, answers 500 without it. */
export const WIDGET_DATA_URL = `${URLS.api}v2/private/backoffice/accounts/widget-data`;

/**
 * Administration -> Office opening hours, where the texts the bot falls back on are edited.
 * Asks for one widget by `domain`, answers 500 without it.
 */
export const ORGANIZATION_WORKING_TIME_URL = `${URLS.api}v2/private/backoffice/configs/organization-working-time`;
