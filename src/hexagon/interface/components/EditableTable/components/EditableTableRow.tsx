import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';
import React from 'react';

interface EditableTableRowProps {
  row: TableRow;
  rowIndex: number;
  columns: ColumnDefinition[];
  getDisplay: (columnId: string) => ColumnDisplayConfig;
  dirtyRowIds: Set<string>;
  validationErrors: Record<string, Record<string, string>>;
  activeCell: { rowId: string; columnId: string } | null;
  onCellChange: (rowId: string, columnId: string, value: string) => void;
  onFocus: (rowId: string, columnId: string) => void;
  onBlur: () => void;
  createCellRef: (rowId: string, columnId: string) => (element: HTMLElement | null) => void;
  children: (props: CellRenderProps) => React.ReactNode;
}

export function EditableTableRow({
  row,
  rowIndex,
  columns,
  getDisplay,
  dirtyRowIds,
  validationErrors,
  activeCell,
  onCellChange,
  onFocus,
  onBlur,
  createCellRef,
  children,
}: EditableTableRowProps) {
  return (
    <div
      key={row.id}
      className="paste-table__row"
      role="row"
      aria-rowindex={rowIndex + 2}
    >
      {columns.map((column, colIndex) => {
        const display = getDisplay(column.id);
        const value = row.cells[column.id] ?? '';
        const isDirty = dirtyRowIds.has(row.id);
        const error = validationErrors[row.id]?.[column.id];
        const isActive =
          activeCell?.rowId === row.id &&
          activeCell?.columnId === column.id;
        const isEditable = column.editable !== false;

        const cellProps: CellRenderProps = {
          row,
          column,
          display,
          value,
          isDirty,
          error,
          isActive,
          isEditable,
          onChange: (newValue: string) => {
            onCellChange(row.id, column.id, newValue);
          },
          onFocus: () => {
            onFocus(row.id, column.id);
          },
          onBlur: () => {
            if (
              activeCell?.rowId === row.id &&
              activeCell?.columnId === column.id
            ) {
              onBlur();
            }
          },
          cellRef: createCellRef(row.id, column.id),
        };

        const hasError = !!error;

        return (
          <div
            key={column.id}
            className={`paste-table__cell-container ${
              isActive ? 'paste-table__cell-container--active' : ''
            } ${hasError ? 'paste-table__cell-container--error' : ''} ${
              isDirty && !hasError ? 'paste-table__cell-container--dirty' : ''
            }`}
            role="gridcell"
            aria-colindex={colIndex + 1}
            aria-selected={isActive || undefined}
          >
            {children?.(cellProps) ?? null}
          </div>
        );
      })}
    </div>
  );
}

