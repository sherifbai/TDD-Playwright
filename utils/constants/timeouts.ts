/** How long a data table may keep redrawing its rows before they are taken as final. */
export const TABLE_SETTLE_TIMEOUT = 5000;

/** How long the rows of the page just left may stay on screen after the page is turned. */
export const TABLE_PAGE_TURN_TIMEOUT = 10000;

/** How long an empty table frame is watched for rows before it is taken as stranded. */
export const EMPTY_TABLE_PROBE_TIMEOUT = 5000;
