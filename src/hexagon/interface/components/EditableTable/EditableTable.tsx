import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';
import {
  EditableTableFooter,
  EditableTableHeader,
  EditableTableRow,
} from '@interface/components/EditableTable/components';
import {
  useTableFocus,
  useTableKeyboardNavigation,
} from '@interface/components/EditableTable/hooks';
import { PasteTableErrorBoundary } from '@interface/components/PasteTable/PasteTableErrorBoundary';
import React, { useCallback, useMemo, useState } from 'react';
import './EditableTable.scss';

export interface EditableTableProps {
  rows: TableRow[];
  columns: ColumnDefinition[];
  displayConfig: ColumnDisplayConfig[];
  dirtyRowIds: Set<string>;
  validationErrors: Record<string, Record<string, string>>;
  onCellChange: (rowId: string, columnId: string, value: string) => void;
  renderCell: (props: CellRenderProps) => React.ReactNode;
  /** Paste handler from hook */
  onPaste?: (e: React.ClipboardEvent<Element>) => void;
  /** Set active cell info (for paste operations) */
  setActiveCellInfo?: (rowId: string, columnId: string) => void;
  /** Clear active cell info */
  clearActiveCellInfo?: () => void;
  /** Whether there are unsaved changes */
  hasUnsavedChanges?: boolean;
  /** Save handler */
  onSave?: () => Promise<void>;
  /** Discard changes handler */
  onDiscard?: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Validation state - whether all rows are valid */
  isValid?: boolean;
  /** Optional class name */
  className?: string;
}

export function EditableTable({
  rows,
  columns,
  displayConfig,
  dirtyRowIds,
  validationErrors,
  onCellChange,
  renderCell,
  onPaste,
  setActiveCellInfo,
  clearActiveCellInfo,
  hasUnsavedChanges = false,
  onSave,
  onDiscard,
  isSaving = false,
  isLoading = false,
  isValid = true,
  className,
}: EditableTableProps) {
  // UI-specific state
  const [activeCell, setActiveCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  // Focus management
  const { focusCell, createCellRef } = useTableFocus();

  // Keyboard navigation
  const { handleKeyDown } = useTableKeyboardNavigation({
    rows,
    columns,
    activeCell,
    focusCell,
  });

  // Helper to get display config for a column
  const getDisplay = useCallback(
    (columnId: string) =>
      displayConfig.find((d) => d.id === columnId) ?? {
        id: columnId,
        label: columnId,
      },
    [displayConfig],
  );

  // Normalize width value for CSS grid (add 'fr' unit if no unit specified)
  const normalizeWidth = (width: string | undefined): string => {
    if (!width) return '1fr';
    if (width.endsWith('fr') || width.endsWith('px') || width.endsWith('%')) {
      return width;
    }
    return `${width}fr`;
  };

  // Process column widths for grid template
  const gridTemplateColumnsValue = useMemo(() => {
    return columns
      .map((col) => {
        const display = getDisplay(col.id);
        return normalizeWidth(display.width);
      })
      .join(' ');
  }, [columns, getDisplay]);

  // Create inline style with CSS variable for grid
  const tableStyle = useMemo(() => {
    return {
      '--grid-template-columns': gridTemplateColumnsValue,
    } as React.CSSProperties;
  }, [gridTemplateColumnsValue]);

  // Handle cell focus
  const handleCellFocus = useCallback(
    (rowId: string, columnId: string) => {
      setActiveCell({ rowId, columnId });
      setActiveCellInfo?.(rowId, columnId);
    },
    [setActiveCellInfo],
  );

  // Handle cell blur
  const handleCellBlur = useCallback(() => {
    setActiveCell(null);
    clearActiveCellInfo?.();
  }, [clearActiveCellInfo]);

  return (
    <PasteTableErrorBoundary>
      <div
        className={`paste-table ${className || ''}`}
        onPaste={onPaste}
        onKeyDown={handleKeyDown}
        style={tableStyle}
        tabIndex={-1}
        role="grid"
        aria-rowcount={rows.length}
        aria-colcount={columns.length}
      >
        {isLoading ? (
          <div
            className="paste-table__loading"
            role="status"
            aria-live="polite"
          >
            <p>Loading table data...</p>
          </div>
        ) : (
          <>
            <div className="paste-table__table-grid" role="presentation">
              <EditableTableHeader columns={columns} getDisplay={getDisplay} />

              <div className="paste-table__body" role="presentation">
                {rows.map((row, rowIndex) => (
                  <EditableTableRow
                    key={row.id}
                    row={row}
                    rowIndex={rowIndex}
                    columns={columns}
                    getDisplay={getDisplay}
                    dirtyRowIds={dirtyRowIds}
                    validationErrors={validationErrors}
                    activeCell={activeCell}
                    onCellChange={onCellChange}
                    onFocus={handleCellFocus}
                    onBlur={handleCellBlur}
                    createCellRef={createCellRef}
                    renderCell={renderCell}
                  />
                ))}
              </div>
            </div>

            <EditableTableFooter
              hasUnsavedChanges={hasUnsavedChanges}
              isValid={isValid}
              isSaving={isSaving}
              onSave={onSave}
              onDiscard={onDiscard}
            />
          </>
        )}
      </div>
    </PasteTableErrorBoundary>
  );
}
