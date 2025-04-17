import type { TableHook } from '../../../application/units/types';
import React from 'react';
import { PasteTableErrorBoundary } from './PasteTableErrorBoundary';
import { TableRow } from './TableRow';
import { usePasteTable } from './usePasteTable';
import './PasteTable.scss';

export interface PasteTableProps<T> {
  /** Core table hook from application layer */
  hook: TableHook<T>;
  /** Optional text for the save button */
  saveButtonText?: string;
  /** Optional text for the clear button */
  clearButtonText?: string;
  /** Optional hint text for paste functionality */
  pasteHint?: string;
}

export function PasteTable<T>({
  hook,
  saveButtonText = 'Save',
  clearButtonText = 'Clear',
  pasteHint = 'Paste tab-separated values',
}: PasteTableProps<T>) {
  // Use our custom interface hook to adapt the application hook
  const {
    rows,
    columns,
    activeCell,
    tableStyle,
    cellHandlers,
    registerCellRef,
    getAriaLabel,
    handlePaste,
    handleKeyDown,
    resetTable,
    saveData,
    isSaveEnabled,
  } = usePasteTable(hook);

  return (
    <PasteTableErrorBoundary>
      <div
        className="paste-table"
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        style={tableStyle}
        tabIndex={-1} // Allow div to receive focus but not in tab order
        role="grid"
        aria-rowcount={rows.length}
        aria-colcount={columns.length}
      >
        <div className="paste-table__table-grid" role="presentation">
          {/* Header row */}
          <div className="paste-table__header" role="row" aria-rowindex={1}>
            {columns.map((column, colIndex) => (
              <div
                key={column.id || `column-${column.label}`}
                className="paste-table__column-header"
                role="columnheader"
                aria-colindex={colIndex + 1}
              >
                {column.label}
              </div>
            ))}
          </div>

          {/* Body rows */}
          <div className="paste-table__body" role="presentation">
            {rows.map((row, rowIndex) => {
              const rowKey =
                row.id || `row-${Math.random().toString(36).substring(2, 9)}`;
              return (
                <TableRow
                  key={rowKey}
                  row={row}
                  columns={columns}
                  activeCell={activeCell}
                  getAriaLabel={getAriaLabel}
                  cellHandlers={cellHandlers}
                  registerCellRef={registerCellRef}
                  rowIndex={rowIndex + 2} // +2 because header is row 1
                />
              );
            })}
          </div>
        </div>

        <div className="paste-table__footer">
          <p className="paste-table__hint">{pasteHint}</p>
          <div className="paste-table__actions">
            <button
              className="paste-table__action-button paste-table__action-button--secondary"
              onClick={resetTable}
              type="button"
            >
              {clearButtonText}
            </button>
            <button
              className="paste-table__action-button paste-table__action-button--primary"
              onClick={saveData}
              disabled={!isSaveEnabled}
              type="button"
            >
              {saveButtonText}
            </button>
          </div>
        </div>
      </div>
    </PasteTableErrorBoundary>
  );
}
