import type { TableHook } from '../../../application/units/types';
import React, { useCallback, useMemo, useState } from 'react';
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
  _columnId: string; // Using underscore prefix to indicate unused param
  _rowId: string; // Using underscore prefix to indicate unused param
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
}: CellRendererProps) {
  const className = `paste-table__cell ${
    columnType !== 'text' ? `paste-table__cell--${columnType}` : ''
  } ${hasError ? 'paste-table__cell--error' : ''}`;

  if (columnType === 'select' && options && options.length > 0) {
    return (
      <select
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
                    const cellKey = `${rowKey}-${columnKey}`;
                    const cellValue = row.cells[column.id] || '';
                    const hasError = row.validationErrors?.[column.id];

                    return (
                      <div
                        key={cellKey}
                        className={`paste-table__cell-container ${
                          activeCell?.rowId === row.id &&
                          activeCell?.columnId === column.id
                            ? 'paste-table__cell-container--active'
                            : ''
                        }`}
                      >
                        <CellRenderer
                          columnType={column.type || 'text'}
                          _columnId={column.id}
                          _rowId={row.id}
                          cellValue={String(cellValue)}
                          hasError={!!hasError}
                          options={column.options}
                          min={column.min}
                          max={column.max}
                          placeholder={column.placeholder}
                          ariaLabel={getAriaLabel(column.id, row.id)}
                          onChange={(value) =>
                            hook.handleCellChange(row.id, column.id, value)
                          }
                          onPaste={(e) =>
                            hook.handleCellPaste(
                              e as unknown as React.ClipboardEvent<HTMLInputElement>,
                              row.id,
                              column.id,
                            )
                          }
                          onFocus={() => handleCellFocus(row.id, column.id)}
                          onBlur={handleCellBlur}
                        />

                        {hasError && (
                          <div className="paste-table__cell-error">
                            {row.validationErrors?.[column.id]}
                          </div>
                        )}
                      </div>
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
