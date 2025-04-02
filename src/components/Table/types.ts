export interface HeaderObject {
  header: string;
  sortable: boolean;
  noWrap?: boolean;
}
export type SortDirection = 'ascending' | 'descending' | 'none';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  value: string;
  operator: string;
}
