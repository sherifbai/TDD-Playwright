import { URLS } from '@utils/env';

/** The back office's own status endpoint: read with GET, written with POST by the header switch. */
export const CSA_ACTIVITY_PATH = 'accounts/customer-support-activity';

export const CSA_ACTIVITY_URL = `${URLS.api}v2/private/backoffice/${CSA_ACTIVITY_PATH}`;
