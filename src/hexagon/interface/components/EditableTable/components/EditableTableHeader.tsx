import type { ColumnDefinition, TableSort } from '@domain/PasteTable';
import type {
  ColumnDisplayConfig,
  PinnedCellProps,
} from '@interface/components/EditableTable/types';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import React from 'react';
import styles from './EditableTableHeader.module.scss';

export interface EditableTableHeaderProps {
  columns: ColumnDefinition[];
  getDisplay: (columnId: string) => ColumnDisplayConfig;
  getPinnedCell?: (columnId: string) => PinnedCellProps | undefined;
  sort?: TableSort | null;
  onSortColumn?: (columnId: string) => void;
}

function SortIcon({
  direction,
}: {
  direction: TableSort['direction'] | undefined;
}): JSX.Element {
  if (direction === undefined) {
    return (
      <span className={styles.sortHint}>
        <Icon name="arrowsSort" size="inline" />
      </span>
    );
  }
  return (
    <Icon
      name={direction === 'ascending' ? 'arrowUp' : 'arrowDown'}
      size="inline"
    />
  );
}

export function EditableTableHeader({
  columns,
  getDisplay,
  getPinnedCell,
  sort,
  onSortColumn,
}: EditableTableHeaderProps) {
  return (
    <tr className="paste-table__header">
      {columns.map((column) => {
        const display = getDisplay(column.id);
        const pinned = getPinnedCell?.(column.id);
        const direction =
          sort?.columnId === column.id ? sort.direction : undefined;
        return (
          <th
            key={column.id}
            className={
              pinned
                ? `paste-table__column-header ${pinned.className}`
                : 'paste-table__column-header'
            }
            style={
              pinned?.style ??
              (display.width ? { width: display.width } : undefined)
            }
            aria-sort={display.sortable ? (direction ?? 'none') : undefined}
          >
            {display.sortable ? (
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => onSortColumn?.(column.id)}
              >
                {display.label}
                <SortIcon direction={direction} />
              </button>
            ) : (
              display.label
            )}
          </th>
        );
      })}
    </tr>
  );
}
