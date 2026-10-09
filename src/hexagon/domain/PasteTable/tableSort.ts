/**
 * Table Sort Types
 *
 * The sort a table shows on its headers. Rows arrive already sorted;
 * a table never sorts them itself.
 */

/** Named like `aria-sort` values, so headers can pass them through */
export type SortDirection = 'ascending' | 'descending';

export interface TableSort {
  columnId: string;
  direction: SortDirection;
}
