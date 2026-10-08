import type { ColumnDefinition } from '@domain/PasteTable';
import type {
  ColumnDisplayConfig,
  PinnedCellProps,
} from '@interface/components/EditableTable/types';
import React from 'react';

interface EditableTableHeaderProps {
  columns: ColumnDefinition[];
  getDisplay: (columnId: string) => ColumnDisplayConfig;
  getPinnedCell?: (columnId: string) => PinnedCellProps | undefined;
}

export function EditableTableHeader({
  columns,
  getDisplay,
  getPinnedCell,
}: EditableTableHeaderProps) {
  return (
    <tr className="paste-table__header">
      {columns.map((column) => {
        const display = getDisplay(column.id);
        const pinned = getPinnedCell?.(column.id);
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
          >
            {display.label}
          </th>
        );
      })}
    </tr>
  );
}
