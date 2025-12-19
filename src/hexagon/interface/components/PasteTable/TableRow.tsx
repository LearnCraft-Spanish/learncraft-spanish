import type {
  ColumnDefinition,
  TableRow as TableRowType,
  ValidationState,
} from '@domain/PasteTable';
import type { ColumnDisplayConfig } from '@interface/components/EditableTable/types';
import { TableCellInput } from '@interface/components/PasteTable/TableCell';
import React from 'react';

export interface TableRowProps {
  row: TableRowType;
  columns: ColumnDefinition[];
  displayConfig: ColumnDisplayConfig[];
  activeCell: { rowId: string; columnId: string } | null;
  validationState: ValidationState;
  getAriaLabel: (columnId: string, rowId: string) => string;
  cellHandlers: {
    onChange: (rowId: string, columnId: string, value: string) => void;
    onFocus: (rowId: string, columnId: string) => void;
    onBlur: () => void;
  };
  registerCellRef: (
    key: string,
    element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null,
  ) => void;
  rowIndex: number;
}

export function TableRow({
  row,
  columns,
  displayConfig,
  activeCell,
  validationState,
  getAriaLabel,
  cellHandlers,
  registerCellRef,
  rowIndex,
}: TableRowProps) {
  const rowErrors = validationState.errors[row.id] || {};

  const getDisplay = (columnId: string) =>
    displayConfig.find((d) => d.id === columnId) ?? { id: columnId, label: columnId };

  return (
    <div className="paste-table__row" role="row" aria-rowindex={rowIndex}>
      {columns.map((column, colIndex) => {
        const cellKey = `${row.id}-${column.id}`;
        const cellValue = row.cells[column.id] || '';
        const errorMessage = rowErrors[column.id];
        const isActive =
          activeCell?.rowId === row.id && activeCell?.columnId === column.id;

        const cellSpecificHandlers = {
          onChange: (value: string) =>
            cellHandlers.onChange(row.id, column.id, value),
          onPaste: (_e: React.ClipboardEvent) =>
            cellHandlers.onFocus(row.id, column.id),
          onFocus: () => cellHandlers.onFocus(row.id, column.id),
          onBlur: cellHandlers.onBlur,
        };

        return (
          <div
            key={cellKey}
            className={`paste-table__cell-container ${isActive ? 'paste-table__cell-container--active' : ''}`}
            role="gridcell"
            aria-colindex={colIndex + 1}
            aria-selected={isActive || undefined}
          >
            <TableCellInput
              cellKey={cellKey}
              column={column}
              display={getDisplay(column.id)}
              cellValue={String(cellValue)}
              hasError={!!errorMessage}
              ariaLabel={getAriaLabel(column.id, row.id)}
              handlers={cellSpecificHandlers}
              cellRef={(el) => registerCellRef(cellKey, el)}
            />

            {errorMessage && isActive && (
              <div className="paste-table__cell-error">{errorMessage}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
