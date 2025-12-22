import type { ColumnDefinition } from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import React from 'react';

interface EditableTableHeaderProps {
  columns: ColumnDefinition[];
  getDisplay: (columnId: string) => ColumnDisplayConfig;
}

export function EditableTableHeader({
  columns,
  getDisplay,
}: EditableTableHeaderProps) {
  return (
    <tr className="paste-table__header">
      {columns.map((column) => {
        const display = getDisplay(column.id);
        return (
          <th
            key={column.id}
            className="paste-table__column-header"
            style={display.width ? { width: display.width } : undefined}
          >
            {display.label}
          </th>
        );
      })}
    </tr>
  );
}

