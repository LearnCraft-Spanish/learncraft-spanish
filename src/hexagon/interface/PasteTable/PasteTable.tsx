import type { TableHook } from '../../application/table/types';
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

export function PasteTable<T>({
  hook,
  saveButtonText = 'Save',
  clearButtonText = 'Clear',
  pasteHint = 'Paste tab-separated values',
}: PasteTableProps<T>) {
  // UI state
  const [activeCell, setActiveCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  // UI calculations
  const gridTemplateColumns = useMemo(() => {
    return hook.columns.map((col) => col.width || '1fr').join(' ');
  }, [hook.columns]);

  const getAriaLabel = useCallback(
    (columnId: string, rowId: string) => {
      const column = hook.columns.find((col) => col.id === columnId);
      return `${column?.label || columnId} input for row ${rowId}`;
    },
    [hook.columns],
  );

  // UI event handlers
  const handleCellFocus = useCallback((rowId: string, columnId: string) => {
    setActiveCell({ rowId, columnId });
  }, []);

  const handleCellBlur = useCallback(() => {
    setActiveCell(null);
  }, []);

  return (
    <PasteTableErrorBoundary>
      <div className="paste-table">
        <div className="paste-table__header" style={{ gridTemplateColumns }}>
          {hook.columns.map((column) => (
            <div key={column.id} className="paste-table__column-header">
              {column.label}
            </div>
          ))}
        </div>

        <div
          className="paste-table__body"
          style={{ gridTemplateColumns }}
          onPaste={hook.handlePaste}
        >
          {hook.data.rows.map((row) => (
            <div key={row.id} className="paste-table__row">
              {hook.columns.map((column) => (
                <div
                  key={`${row.id}-${column.id}`}
                  className={`paste-table__cell-container ${
                    activeCell?.rowId === row.id &&
                    activeCell?.columnId === column.id
                      ? 'paste-table__cell-container--active'
                      : ''
                  }`}
                >
                  <input
                    type="text"
                    value={row.cells[column.id] || ''}
                    onChange={(e) =>
                      hook.handleCellChange(row.id, column.id, e.target.value)
                    }
                    onFocus={() => handleCellFocus(row.id, column.id)}
                    onBlur={handleCellBlur}
                    className="paste-table__cell"
                    aria-label={getAriaLabel(column.id, row.id)}
                    aria-invalid={!!row.validationErrors?.[column.id]}
                  />
                </div>
              ))}
            </div>
          ))}
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
