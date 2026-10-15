import type {
  EditableTableProps,
  PinnedCellProps,
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
import { getPinnedColumnLayout } from '@interface/components/EditableTable/pinnedColumns';
import { PasteTableErrorBoundary } from '@interface/components/PasteTable/PasteTableErrorBoundary';
import React, { useCallback, useMemo, useState } from 'react';
import styles from './EditableTable.module.scss';
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
  sort,
  onSortColumn,
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

  const pinnedLayout = useMemo(
    () => getPinnedColumnLayout(columns, getDisplay),
    [columns, getDisplay],
  );

  const getPinnedCell = useCallback(
    (columnId: string): PinnedCellProps | undefined => {
      const pinned = pinnedLayout.pinnedColumns[columnId];
      if (!pinned) return undefined;
      const sideClass =
        pinned.side === 'left' ? styles.pinnedLeft : styles.pinnedRight;
      const edgeClass =
        pinned.side === 'left' ? styles.pinnedLeftEdge : styles.pinnedRightEdge;
      return {
        className: pinned.isInnerEdge ? `${sideClass} ${edgeClass}` : sideClass,
        style: pinned.style,
      };
    },
    [pinnedLayout],
  );

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

  const table = (
    <table
      className={
        pinnedLayout.isScrollable
          ? `paste-table__table ${styles.scrollingTable}`
          : 'paste-table__table'
      }
      style={pinnedLayout.tableStyle}
    >
      <thead>
        <EditableTableHeader
          columns={columns}
          getDisplay={getDisplay}
          getPinnedCell={getPinnedCell}
          sort={sort}
          onSortColumn={onSortColumn}
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
            getPinnedCell={getPinnedCell}
          />
        ))}
      </tbody>
    </table>
  );

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
            {pinnedLayout.isScrollable ? (
              <div className={styles.scrollContainer}>{table}</div>
            ) : (
              table
            )}

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
