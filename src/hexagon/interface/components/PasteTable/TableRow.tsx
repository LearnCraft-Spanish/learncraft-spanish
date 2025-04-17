import type {
  TableColumn,
  TableRow as TableRowType,
} from '../../../application/units/types';
import React from 'react';
import { TableCellInput } from './TableCell';

export interface TableRowProps {
  row: TableRowType;
  columns: TableColumn[];
  activeCell: { rowId: string; columnId: string } | null;
  getAriaLabel: (columnId: string, rowId: string) => string;
  cellHandlers: {
    onChange: (rowId: string, columnId: string, value: string) => void;
    onFocus: (rowId: string, columnId: string) => void;
    onBlur: () => void;
  };
  registerCellRef: (
    key: string,
    element: HTMLInputElement | HTMLSelectElement | null,
  ) => void;
}

export function TableRow({
  row,
  columns,
  activeCell,
  getAriaLabel,
  cellHandlers,
  registerCellRef,
}: TableRowProps) {
  return (
    <div className="paste-table__row">
      {columns.map((column) => {
        const columnKey = column.id;
        const cellKey = `${row.id}-${columnKey}`;
        const cellValue = row.cells[column.id] || '';
        const errorMessage = row.validationErrors?.[column.id];
        const isActive =
          activeCell?.rowId === row.id && activeCell?.columnId === column.id;

        // Create cell-specific handlers that include row and column context
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
            className={`paste-table__cell-container ${
              isActive ? 'paste-table__cell-container--active' : ''
            }`}
          >
            <TableCellInput
              columnType={column.type || 'text'}
              cellValue={String(cellValue)}
              hasError={!!errorMessage}
              options={column.options}
              min={column.min}
              max={column.max}
              placeholder={column.placeholder}
              ariaLabel={getAriaLabel(column.id, row.id)}
              handlers={cellSpecificHandlers}
              cellRef={(el) => registerCellRef(cellKey, el)}
            />

            {errorMessage && (
              <div className="paste-table__cell-error">{errorMessage}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
