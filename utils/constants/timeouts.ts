/** The budget for one test: what a project's `timeout` gives a single test to finish in. */
export const TEST_TIMEOUT = 120000;

/** How long one interaction with the admin may take to land, and the cap on a flow's action. */
export const ACTION_TIMEOUT = 15000;

/** How long a data table may keep redrawing its rows before they are taken as final. */
export const TABLE_SETTLE_TIMEOUT = 5000;

/** How long the rows of the page just left may stay on screen after the page is turned. */
export const TABLE_PAGE_TURN_TIMEOUT = 10000;

/** How long the widget may take to answer, whether the reply comes from the bot or an operator. */
export const WIDGET_REPLY_TIMEOUT = 30000;

/** How long the widget may take to redraw itself, whether after a message or after a reload. */
export const WIDGET_REDRAW_TIMEOUT = 15000;

/** How long the widget may keep its message box hidden before it is reloaded. */
export const WIDGET_MESSAGE_BOX_TIMEOUT = 10000;
