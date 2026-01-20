import type { DiffsMap } from '@application/units/pasteTable/hooks/useDiffs';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import { useDiffs, useTablePaste } from '@application/units/pasteTable/hooks';
import { mergeSourceWithDiffs } from '@domain/PasteTable/functions';
import { useCallback, useMemo } from 'react';

/**
 * Edit table state hook interface
 * Focused on state management only - no mapping, no validation
 */
export interface EditTableStateHook {
  // Data
  data: {
    rows: TableRow[];
    columns: ColumnDefinition[];
  };

  // Operations
  updateCell: (rowId: string, columnId: string, value: string) => null;
  handlePaste: (e: ClipboardEvent<Element>) => void;
  discardChanges: () => void;

  // Focus tracking
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;

  // State
  hasUnsavedChanges: boolean;
  dirtyRowIds: Set<string>;
  diffs: DiffsMap;

  // Expose for use case to map
  getDirtyRows: () => TableRow[];
  setRowsViaDiffs: (rows: TableRow[]) => void;
}

interface UseEditTableStateOptions {
  /** Source rows (already mapped to TableRow[], not domain entities) */
  sourceRows: TableRow[];
  columns: ColumnDefinition[];
  /**
   * Optional function to compute derived fields for merged rows
   * Called after source + diffs are merged
   */
  computeDerivedFields?: (row: TableRow) => Record<string, string>;
}

/**
 * Hook for edit table state management
 * Focused on state only - no mapping, no validation
 * Use case handles mapping and validation separately
 */
export function useEditTableState({
  sourceRows,
  columns,
  computeDerivedFields,
}: UseEditTableStateOptions): EditTableStateHook {
  // Get editable column IDs
  const editableColumnIds = useMemo(
    () =>
      columns
        .filter((col) => col.editable !== false && !col.derived)
        .map((col) => col.id),
    [columns],
  );

  // Diffs-only state management
  const { diffs, dirtyRowIds, updateDiff, setRowsViaDiffs, clearDiffs } =
    useDiffs({
      sourceRows,
      editableColumnIds,
    });

  // Derive display rows by merging source with diffs
  // If computeDerivedFields is provided, recompute derived fields after merging
  const rows = useMemo(() => {
    const merged = mergeSourceWithDiffs(sourceRows, diffs);

    if (computeDerivedFields) {
      // Recompute derived fields from current merged cell values
      return merged.map((row) => {
        const derived = computeDerivedFields(row);
        return {
          ...row,
          cells: {
            ...row.cells,
            ...derived,
          },
        };
      });
    }

    return merged;
  }, [sourceRows, diffs, computeDerivedFields]);

  // Cell update wrapper that updates diffs
  const updateCellForPaste = useCallback(
    (rowId: string, columnId: string, value: string) => {
      updateDiff(rowId, columnId, value);
    },
    [updateDiff],
  );

  // Paste handling - uses setRowsViaDiffs for bulk operations
  const { setActiveCellInfo, clearActiveCellInfo, handlePaste } = useTablePaste(
    {
      columns,
      rows,
      updateCell: updateCellForPaste,
      setRows: setRowsViaDiffs,
      mode: 'edit',
      idColumnId: 'id', // Default, use case can override if needed
    },
  );

  // Cell update - returns null (no ghost row conversion in edit mode)
  const updateCell = useCallback(
    (rowId: string, columnId: string, value: string) => {
      updateDiff(rowId, columnId, value);
      return null;
    },
    [updateDiff],
  );

  // Discard changes - just clear diffs
  const discardChanges = useCallback(() => {
    clearDiffs();
    clearActiveCellInfo();
  }, [clearDiffs, clearActiveCellInfo]);

  // Get dirty rows for use case to map
  const getDirtyRows = useCallback(() => {
    const currentDirtyIds = new Set(diffs.keys());
    return rows.filter((row) => currentDirtyIds.has(row.id));
  }, [rows, diffs]);

  return {
    data: {
      rows,
      columns,
    },
    updateCell,
    handlePaste,
    discardChanges,
    setActiveCellInfo,
    clearActiveCellInfo,
    hasUnsavedChanges: dirtyRowIds.size > 0,
    dirtyRowIds,
    diffs,
    getDirtyRows,
    setRowsViaDiffs,
  };
}
