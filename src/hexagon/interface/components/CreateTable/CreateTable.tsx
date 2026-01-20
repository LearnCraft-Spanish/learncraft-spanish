import type { CreateTableProps } from '@interface/components/CreateTable/types';
import { CreateTableFooter } from '@interface/components/CreateTable/CreateTableFooter';
import {
  EditableTableHeader,
  EditableTableRow,
} from '@interface/components/EditableTable/components';
import {
  useTableFocus,
  useTableKeyboardNavigation,
} from '@interface/components/EditableTable/hooks';
import { PasteTableErrorBoundary } from '@interface/components/PasteTable/PasteTableErrorBoundary';
import React, { useCallback, useMemo } from 'react';

export function CreateTable({
  rows,
  columns,
  displayConfig,
  validationErrors,
  onCellChange,
  renderCell,
  onPaste,
  activeCell,
  setActiveCell,
  setActiveCellInfo,
  clearActiveCellInfo,
  hasData = false,
  onSave,
  onReset,
  isSaving = false,
  isValid = true,
  className,
}: CreateTableProps) {
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
    [setActiveCell, setActiveCellInfo],
  );

  // Handle cell blur
  const handleCellBlur = useCallback(() => {
    setActiveCell(null);
    clearActiveCellInfo?.();
  }, [setActiveCell, clearActiveCellInfo]);

  // Wrap createCellRef to handle focus when cell mounts if it matches activeCell
  const createCellRefWithFocus = useCallback(
    (rowId: string, columnId: string) => {
      const baseRef = createCellRef(rowId, columnId);
      return (element: HTMLElement | null) => {
        baseRef(element);
        // If this cell matches activeCell, focus it when it mounts
        if (
          element &&
          activeCell?.rowId === rowId &&
          activeCell?.columnId === columnId
        ) {
          element.focus();
          // Only set selection range for text inputs (not number, email, etc.)
          if (
            element instanceof HTMLInputElement &&
            element.type === 'text' &&
            element.value
          ) {
            const length = element.value.length;
            element.setSelectionRange(length, length);
          }
        }
      };
    },
    [createCellRef, activeCell],
  );

  return (
    <PasteTableErrorBoundary>
      <div
        className={`paste-table paste-table--create ${className || ''}`}
        onPaste={onPaste}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <table className="paste-table__table" style={tableStyle}>
          <thead>
            <EditableTableHeader columns={columns} getDisplay={getDisplay} />
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <EditableTableRow
                key={row.id}
                row={row}
                rowIndex={rowIndex}
                columns={columns}
                getDisplay={getDisplay}
                dirtyRowIds={new Set()} // Create mode has no dirty tracking
                validationErrors={validationErrors}
                activeCell={activeCell}
                onCellChange={onCellChange}
                onFocus={handleCellFocus}
                onBlur={handleCellBlur}
                createCellRef={createCellRefWithFocus}
                renderCell={renderCell}
              />
            ))}
          </tbody>
        </table>

        <CreateTableFooter
          hasData={hasData}
          isValid={isValid}
          isSaving={isSaving}
          onSave={onSave}
          onReset={onReset}
        />
      </div>
    </PasteTableErrorBoundary>
  );
}
