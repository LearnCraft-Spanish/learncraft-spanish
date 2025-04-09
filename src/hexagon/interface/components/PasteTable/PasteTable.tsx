import type { TableHook } from '../../../application/units/types';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { PasteTableErrorBoundary } from './PasteTableErrorBoundary';
import './PasteTable.scss';

interface PasteTableProps<T> {
  /** Core table hook from application layer */
  hook: TableHook<T>;
  /** Optional text for the save button */
  saveButtonText?: string;
  /** Optional text for the clear button */
  clearButtonText?: string;
  /** Optional hint text for paste functionality */
  pasteHint?: string;
}

// Extracted cell renderer component for better maintainability
interface CellRendererProps {
  columnType: string;
  cellValue: string;
  hasError: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  placeholder?: string;
  ariaLabel: string;
  onChange: (value: string) => void;
  onPaste: (
    e: React.ClipboardEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onFocus: () => void;
  onBlur: () => void;
  cellRef: React.RefCallback<HTMLInputElement | HTMLSelectElement>;
}

function CellRenderer({
  columnType,
  cellValue,
  hasError,
  options,
  min,
  max,
  placeholder,
  ariaLabel,
  onChange,
  onPaste,
  onFocus,
  onBlur,
  cellRef,
}: CellRendererProps) {
  const className = `paste-table__cell ${
    columnType !== 'text' ? `paste-table__cell--${columnType}` : ''
  } ${hasError ? 'paste-table__cell--error' : ''}`;

  if (columnType === 'select' && options && options.length > 0) {
    return (
      <select
        ref={cellRef}
        value={String(cellValue)}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className={className}
        aria-label={ariaLabel}
        aria-invalid={!!hasError}
      >
        <option value="">-- Select --</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const inputTypes = {
    number: 'number',
    date: 'date',
    text: 'text',
  };

  const inputType = inputTypes[columnType as keyof typeof inputTypes] || 'text';

  return (
    <input
      ref={cellRef}
      type={inputType}
      value={String(cellValue)}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      onPaste={onPaste}
      onFocus={onFocus}
      onBlur={onBlur}
      className={className}
      aria-label={ariaLabel}
      aria-invalid={!!hasError}
      placeholder={placeholder}
    />
  );
}

// TableCell component to encapsulate a single cell
interface TableCellProps {
  rowId: string;
  columnId: string;
  column: any;
  cellValue: string;
  hasError: boolean;
  isActive: boolean;
  getAriaLabel: (columnId: string, rowId: string) => string;
  onFocus: (rowId: string, columnId: string) => void;
  onBlur: () => void;
  onValueChange: (rowId: string, columnId: string, value: string) => void;
  onCellPaste: (
    e: React.ClipboardEvent<HTMLInputElement>,
    rowId: string,
    columnId: string,
  ) => void;
  registerRef: (
    key: string,
    element: HTMLInputElement | HTMLSelectElement | null,
  ) => void;
  errorMessage?: string;
}

function TableCell({
  rowId,
  columnId,
  column,
  cellValue,
  hasError,
  isActive,
  getAriaLabel,
  onFocus,
  onBlur,
  onValueChange,
  onCellPaste,
  registerRef,
  errorMessage,
}: TableCellProps) {
  const cellKey = `${rowId}-${columnId}`;

  // Use callback ref pattern - this runs when the element is mounted/updated/unmounted
  const cellRefCallback = useCallback(
    (element: HTMLInputElement | HTMLSelectElement | null) => {
      registerRef(cellKey, element);
    },
    [cellKey, registerRef],
  );

  return (
    <div
      className={`paste-table__cell-container ${
        isActive ? 'paste-table__cell-container--active' : ''
      }`}
    >
      <CellRenderer
        columnType={column.type || 'text'}
        cellValue={String(cellValue)}
        hasError={hasError}
        options={column.options}
        min={column.min}
        max={column.max}
        placeholder={column.placeholder}
        ariaLabel={getAriaLabel(columnId, rowId)}
        onChange={(value) => onValueChange(rowId, columnId, value)}
        onPaste={(e) =>
          onCellPaste(
            e as unknown as React.ClipboardEvent<HTMLInputElement>,
            rowId,
            columnId,
          )
        }
        onFocus={() => onFocus(rowId, columnId)}
        onBlur={onBlur}
        cellRef={cellRefCallback}
      />

      {hasError && errorMessage && (
        <div className="paste-table__cell-error">{errorMessage}</div>
      )}
    </div>
  );
}

export function PasteTable<T>({
  hook,
  saveButtonText = 'Save',
  clearButtonText = 'Clear',
  pasteHint = 'Paste tab-separated values',
}: PasteTableProps<T>) {
  // UI state - use hook's cell tracking functions
  const [activeCell, setActiveCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  // Create a ref map for cell input elements
  const cellRefs = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(
    new Map(),
  );

  // Function to register cell refs
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

  // Process column widths to ensure they are valid CSS grid template values
  const gridTemplateColumnsValue = useMemo(() => {
    return hook.columns
      .map((col) => {
        const width = col.width || '1fr';
        // Ensure width has a valid CSS unit
        return width.endsWith('fr') ||
          width.endsWith('px') ||
          width.endsWith('%')
          ? width
          : `${width}fr`;
      })
      .join(' ');
  }, [hook.columns]);

  // Create inline style with CSS variable for grid
  const tableStyle = useMemo(() => {
    return {
      '--grid-template-columns': gridTemplateColumnsValue,
    } as React.CSSProperties;
  }, [gridTemplateColumnsValue]);

  const getAriaLabel = useCallback(
    (columnId: string, rowId: string) => {
      const column = hook.columns.find((col) => col.id === columnId);
      return `${column?.label || columnId} input for row ${rowId}`;
    },
    [hook.columns],
  );

  // UI event handlers
  const handleCellFocus = useCallback(
    (rowId: string, columnId: string) => {
      setActiveCell({ rowId, columnId });
      hook.setActiveCellInfo(rowId, columnId);
    },
    [hook],
  );

  const handleCellBlur = useCallback(() => {
    setActiveCell(null);
    hook.clearActiveCellInfo();
  }, [hook]);

  // Handle cell value change with focus management
  const handleCellValueChange = useCallback(
    (rowId: string, columnId: string, value: string) => {
      // Call handleCellChange and get the possibly new row ID
      const newRowId = hook.handleCellChange(rowId, columnId, value);

      // If a new row was created (ghost row was converted)
      if (newRowId) {
        // Update the active cell state immediately
        setActiveCell({
          rowId: newRowId,
          columnId,
        });

        // Give React a chance to render the new row, then focus
        setTimeout(() => {
          const newCellKey = `${newRowId}-${columnId}`;
          const newCell = cellRefs.current.get(newCellKey);

          if (newCell) {
            newCell.focus();

            // If input element, move cursor to end
            if (newCell instanceof HTMLInputElement && newCell.value) {
              const length = newCell.value.length;
              newCell.setSelectionRange(length, length);
            }
          }
        }, 0);
      }
    },
    [hook],
  );

  // Filter out duplicate row IDs
  const uniqueRows = useMemo(() => {
    const seenIds = new Set<string>();
    return hook.data.rows.filter((row) => {
      const rowId = row.id || 'unknown-row';
      if (seenIds.has(rowId)) {
        console.error('Duplicate row ID detected:', rowId);
        return false;
      }
      seenIds.add(rowId);
      return true;
    });
  }, [hook.data.rows]);

  return (
    <PasteTableErrorBoundary>
      <div
        className="paste-table"
        onPaste={hook.handlePaste}
        style={tableStyle}
      >
        <div className="paste-table__table-grid">
          {/* Header row */}
          <div className="paste-table__header">
            {hook.columns.map((column) => (
              <div
                key={column.id || `column-${column.label}`}
                className="paste-table__column-header"
              >
                {column.label}
              </div>
            ))}
          </div>

          {/* Body rows */}
          <div className="paste-table__body">
            {uniqueRows.map((row) => {
              const rowKey =
                row.id || `row-${Math.random().toString(36).substring(2, 9)}`;
              return (
                <div key={rowKey} className="paste-table__row">
                  {hook.columns.map((column) => {
                    const columnKey = column.id || `column-${column.label}`;
                    const cellValue = row.cells[column.id] || '';
                    const errorMessage = row.validationErrors?.[column.id];

                    return (
                      <TableCell
                        key={`${rowKey}-${columnKey}`}
                        rowId={row.id}
                        columnId={column.id}
                        column={column}
                        cellValue={cellValue}
                        hasError={!!errorMessage}
                        isActive={
                          activeCell?.rowId === row.id &&
                          activeCell?.columnId === column.id
                        }
                        getAriaLabel={getAriaLabel}
                        onFocus={handleCellFocus}
                        onBlur={handleCellBlur}
                        onValueChange={handleCellValueChange}
                        onCellPaste={hook.handleCellPaste}
                        registerRef={registerCellRef}
                        errorMessage={errorMessage}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className="paste-table__footer">
          <p className="paste-table__hint">{pasteHint}</p>
          <div className="paste-table__actions">
            <button
              className="paste-table__action-button paste-table__action-button--secondary"
              onClick={hook.clearTable}
              type="button"
            >
              {clearButtonText}
            </button>
            <button
              className="paste-table__action-button paste-table__action-button--primary"
              onClick={hook.handleSave}
              disabled={!hook.isSaveEnabled}
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
