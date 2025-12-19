import type { CellRenderProps } from '@interface/components/EditableTable/types';
import { TableCellInput } from '@interface/components/PasteTable/TableCell';
import React from 'react';

/**
 * Standard cell renderer for EditableTable
 * Uses the existing TableCellInput component to handle all column types
 */
export function StandardCell(props: CellRenderProps) {
  const {
    row,
    column,
    display,
    value,
    error,
    isActive,
    onChange,
    onFocus,
    onBlur,
    cellRef,
  } = props;

  const cellKey = `${row.id}-${column.id}`;
  const ariaLabel = `${display.label} input for row ${row.id}`;

  const handlers = {
    onChange,
    onPaste: () => {}, // Handled by EditableTable's onPaste
    onFocus,
    onBlur,
  };

  return (
    <>
      <TableCellInput
        cellKey={cellKey}
        column={column}
        display={display}
        cellValue={value}
        hasError={!!error}
        ariaLabel={ariaLabel}
        handlers={handlers}
        cellRef={cellRef}
      />
      {error && isActive && (
        <div className="paste-table__cell-error" role="alert">
          {error}
        </div>
      )}
    </>
  );
}
