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
  createCellRef: (
    rowId: string,
    columnId: string,
  ) => (element: HTMLElement | null) => void;
  /**
   * Cell renderer function from parent EditableTable
   * Called once per cell to determine which component to render
   */
  renderCell: (props: CellRenderProps) => React.ReactNode;
}

export function EditableTableRow({
  row,
  columns,
  getDisplay,
  dirtyRowIds,
  validationErrors,
  activeCell,
  onCellChange,
  onFocus,
  onBlur,
  createCellRef,
  renderCell,
}: EditableTableRowProps) {
  return (
    <tr className="paste-table__row">
      {columns.map((column) => {
        // Extract cell state and metadata
        const display = getDisplay(column.id);
        const value = row.cells[column.id] ?? '';
        const isDirty = dirtyRowIds.has(row.id);
        const error = validationErrors[row.id]?.[column.id];
        const isActive =
          activeCell?.rowId === row.id && activeCell?.columnId === column.id;
        const isEditable = column.editable !== false;

        // Construct props object for cell renderer
        // This object contains all state and handlers needed by any cell component
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

        // Render the cell using the renderer function from parent
        // The renderer decides which component to use (StandardCell, custom component, etc.)
        return (
          <td
            key={column.id}
            className={`paste-table__cell-container ${
              isActive ? 'paste-table__cell-container--active' : ''
            } ${hasError ? 'paste-table__cell-container--error' : ''} ${
              isDirty && !hasError ? 'paste-table__cell-container--dirty' : ''
            }`}
            aria-selected={isActive || undefined}
          >
            {renderCell(cellProps)}
          </td>
        );
      })}
    </tr>
  );
}
