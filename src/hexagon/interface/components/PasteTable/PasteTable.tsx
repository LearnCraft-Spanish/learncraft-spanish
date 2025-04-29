import type { TableHook } from '../../../application/units/pasteTable/types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { PasteTableErrorBoundary } from './PasteTableErrorBoundary';
import { TableRow } from './TableRow';
import './PasteTable.scss';

export interface PasteTableProps<T> {
  /** Core table hook from application layer */
  hook: TableHook<T>;
  /** Optional text for the clear button */
  clearButtonText?: string;
  /** Optional hint text for paste functionality */
  pasteHint?: string;
  /** Optional hint text for validation */
  validationHint?: string;
}

// Helper function to find index in array
function findIndex<T>(array: T[], predicate: (item: T) => boolean): number {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
}

export function PasteTable<T>({
  hook,
  clearButtonText = 'Clear',
  pasteHint = 'Paste tab-separated values',
  validationHint = 'Fields are validated in real-time',
}: PasteTableProps<T>) {
  // Get application data and functions directly from the hook
  const {
    data,
    updateCell,
    resetTable,
    handlePaste,
    setActiveCellInfo,
    clearActiveCellInfo,
    validationState,
  } = hook;

  const { rows, columns } = data;

  // UI-specific state
  const [activeCell, setActiveCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  // Refs for cell elements
  const cellRefs = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(
    new Map(),
  );

  // Process column widths for grid template
  const gridTemplateColumnsValue = useMemo(() => {
    return columns
      .map((col) => {
        const width = col.width || '1fr';
        return width.endsWith('fr') ||
          width.endsWith('px') ||
          width.endsWith('%')
          ? width
          : `${width}fr`;
      })
      .join(' ');
  }, [columns]);

  // Create inline style with CSS variable for grid
  const tableStyle = useMemo(() => {
    return {
      '--grid-template-columns': gridTemplateColumnsValue,
    } as React.CSSProperties;
  }, [gridTemplateColumnsValue]);

  // Register cell refs
  const registerCellRef = useCallback(
    (key: string, element: HTMLInputElement | HTMLSelectElement | null) => {
      if (element) {
        cellRefs.current.set(key, element);
      } else {
        cellRefs.current.delete(key);
      }
    },
    [],
  );

  // Focus a specific cell
  const focusCell = useCallback((rowId: string, columnId: string) => {
    const cellKey = `${rowId}-${columnId}`;
    const element = cellRefs.current.get(cellKey);

    if (element) {
      element.focus();
      if (element instanceof HTMLInputElement && element.value) {
        const length = element.value.length;
        element.setSelectionRange(length, length);
      }
    }
  }, []);

  // Generate ARIA labels
  const getAriaLabel = useCallback(
    (columnId: string, rowId: string) => {
      const column = columns.find((col) => col.id === columnId);
      return `${column?.label || columnId} input for row ${rowId}`;
    },
    [columns],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!activeCell) return;

      const rowIndex = findIndex(rows, (row) => row.id === activeCell.rowId);
      const colIndex = findIndex(
        columns,
        (col) => col.id === activeCell.columnId,
      );

      if (rowIndex === -1 || colIndex === -1) return;

      let nextRowIndex = rowIndex;
      let nextColIndex = colIndex;

      // Handle arrow key navigation
      switch (e.key) {
        case 'ArrowUp':
          if (rowIndex > 0) {
            nextRowIndex = rowIndex - 1;
            e.preventDefault();
          }
          break;
        case 'ArrowDown':
          if (rowIndex < rows.length - 1) {
            nextRowIndex = rowIndex + 1;
            e.preventDefault();
          }
          break;
        case 'ArrowLeft':
          if (
            e.ctrlKey ||
            e.metaKey ||
            (e.target instanceof HTMLInputElement &&
              e.target.selectionStart === 0 &&
              e.target.selectionEnd === 0)
          ) {
            if (colIndex > 0) {
              nextColIndex = colIndex - 1;
              e.preventDefault();
            } else if (rowIndex > 0) {
              nextRowIndex = rowIndex - 1;
              nextColIndex = columns.length - 1;
              e.preventDefault();
            }
          }
          break;
        case 'ArrowRight':
          if (
            e.ctrlKey ||
            e.metaKey ||
            (e.target instanceof HTMLInputElement &&
              e.target.selectionStart === e.target.value.length &&
              e.target.selectionEnd === e.target.value.length)
          ) {
            if (colIndex < columns.length - 1) {
              nextColIndex = colIndex + 1;
              e.preventDefault();
            } else if (rowIndex < rows.length - 1) {
              nextRowIndex = rowIndex + 1;
              nextColIndex = 0;
              e.preventDefault();
            }
          }
          break;
        case 'Tab':
          if (!e.shiftKey) {
            if (colIndex < columns.length - 1) {
              nextColIndex = colIndex + 1;
            } else if (rowIndex < rows.length - 1) {
              nextRowIndex = rowIndex + 1;
              nextColIndex = 0;
            }
          } else {
            if (colIndex > 0) {
              nextColIndex = colIndex - 1;
            } else if (rowIndex > 0) {
              nextRowIndex = rowIndex - 1;
              nextColIndex = columns.length - 1;
            }
          }
          if (nextRowIndex !== rowIndex || nextColIndex !== colIndex) {
            e.preventDefault();
          }
          break;
        case 'Enter':
          if (e.shiftKey) {
            if (rowIndex > 0) {
              nextRowIndex = rowIndex - 1;
              e.preventDefault();
            }
          } else {
            if (rowIndex < rows.length - 1) {
              nextRowIndex = rowIndex + 1;
              e.preventDefault();
            }
          }
          break;
      }

      // Focus the new cell if position changed
      if (nextRowIndex !== rowIndex || nextColIndex !== colIndex) {
        const nextRow = rows[nextRowIndex];
        const nextColumn = columns[nextColIndex];
        if (nextRow && nextColumn) {
          focusCell(nextRow.id, nextColumn.id);
        }
      }
    },
    [activeCell, rows, columns, focusCell],
  );

  // Cell handlers
  const cellHandlers = useMemo(
    () => ({
      onFocus: (rowId: string, columnId: string) => {
        setActiveCell({ rowId, columnId });
        setActiveCellInfo(rowId, columnId);
      },
      onBlur: () => {
        setActiveCell(null);
        clearActiveCellInfo();
      },
      onChange: (rowId: string, columnId: string, value: string) => {
        const newRowId = updateCell(rowId, columnId, value);
        if (newRowId) {
          setActiveCell({ rowId: newRowId, columnId });
          requestAnimationFrame(() => {
            focusCell(newRowId, columnId);
          });
        }
      },
    }),
    [setActiveCellInfo, clearActiveCellInfo, updateCell, focusCell],
  );

  // Enhanced reset handler to completely clear all state
  const handleReset = useCallback(() => {
    console.error('Starting UI reset'); // Debugging

    // Reset table data via application hook
    resetTable();

    // Fully reset UI state
    setActiveCell(null);

    // Clear all cell references
    cellRefs.current.clear();

    // Force focus to the table container to ensure no lingering focus
    // This helps prevent keyboard events from firing on stale cells
    const tableEl = document.querySelector('.paste-table');
    if (tableEl instanceof HTMLElement) {
      tableEl.focus();
    }

    console.error('UI reset complete'); // Debugging
  }, [resetTable]);

  return (
    <PasteTableErrorBoundary>
      <div
        className="paste-table"
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        style={tableStyle}
        tabIndex={-1}
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
              // Ensure a stable, unique key for each row
              const rowKey =
                row.id === 'ghost-row'
                  ? 'ghost-row'
                  : row.id ||
                    `row-fallback-${rowIndex}-${Math.random().toString(36).substring(2, 7)}`;

              return (
                <TableRow
                  key={rowKey}
                  row={row}
                  columns={columns}
                  activeCell={activeCell}
                  validationState={validationState}
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
          <div className="paste-table__hints">
            <p className="paste-table__hint">{pasteHint}</p>
            <p className="paste-table__hint paste-table__hint--validation">
              {validationHint}
            </p>
            {!validationState.isValid && (
              <p className="paste-table__hint paste-table__hint--error">
                Please fix validation errors before saving
              </p>
            )}
          </div>
          <div className="paste-table__actions">
            <button
              className="paste-table__action-button paste-table__action-button--secondary"
              onClick={handleReset}
              type="button"
            >
              {clearButtonText}
            </button>
          </div>
        </div>
      </div>
    </PasteTableErrorBoundary>
  );
}
