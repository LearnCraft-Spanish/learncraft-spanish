import type { EditableTableProps } from '@interface/components/EditableTable/types';
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

  // Table style - column widths are applied via colgroup or inline styles on th/td
  const tableStyle = useMemo(() => {
    return {} as React.CSSProperties;
  }, []);

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
        tabIndex={-1}
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
            <table className="paste-table__table" style={tableStyle}>
              <thead>
                <EditableTableHeader
                  columns={columns}
                  getDisplay={getDisplay}
                />
              </thead>
              <tbody>
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
              </tbody>
            </table>

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
