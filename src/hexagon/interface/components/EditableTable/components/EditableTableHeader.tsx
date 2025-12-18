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
    <div className="paste-table__header" role="row" aria-rowindex={1}>
      {columns.map((column, colIndex) => {
        const display = getDisplay(column.id);
        return (
          <div
            key={column.id}
            className="paste-table__column-header"
            role="columnheader"
            aria-colindex={colIndex + 1}
          >
            {display.label}
          </div>
        );
      })}
    </div>
  );
}

