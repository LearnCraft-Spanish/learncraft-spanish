import type { TableRow } from '@domain/PasteTable/types';
import { cellsEqual } from '@domain/PasteTable/functions/rowComparison';
import { useMemo, useRef, useState } from 'react';

interface UseDirtyStateTrackingProps {
  rows: TableRow[];
  cleanRows: TableRow[];
  idColumnId: string;
}

/**
 * Hook to track dirty state by comparing current rows to clean rows
 * Computes dirty state reactively and syncs to state
 *
 * TODO: This hook may be overcomplicated. The useState + manual marking functions
 * (markRowDirty, clearDirtyRows, clearAllDirty) appear redundant since dirty state
 * is derived from comparing rows to cleanRows in the useMemo. The memo overwrites
 * any manual state changes on re-render. Consider simplifying to just return the
 * memo result directly, and have callers update cleanRows to affect dirty state.
 * Verify with manual UI testing before refactoring.
 */
export function useDirtyStateTracking({
  rows,
  cleanRows,
  idColumnId,
}: UseDirtyStateTrackingProps) {
  // Track dirty row IDs state
  const [dirtyRowIds, setDirtyRowIds] = useState<Set<string>>(() => new Set());

  // Recalculate dirty state reactively (derived from current rows vs cleanRows)
  const computedDirtyRowIds = useMemo(() => {
    const newDirty = new Set<string>();

    rows.forEach((currentRow) => {
      const cleanRow = cleanRows.find(
        (cr) =>
          cr.id === currentRow.id ||
          Number(cr.cells[idColumnId]) === Number(currentRow.cells[idColumnId]),
      );

      if (cleanRow && !cellsEqual(currentRow.cells, cleanRow.cells)) {
        newDirty.add(currentRow.id);
      }
    });

    return newDirty;
  }, [rows, cleanRows, idColumnId]);

  // Sync computed dirty state to state when it changes
  // Initialize ref with undefined so first render triggers sync
  const prevComputedDirtyRef = useRef<Set<string> | undefined>(undefined);
  if (prevComputedDirtyRef.current !== computedDirtyRowIds) {
    // Only update if actually different (avoid infinite loops)
    const isDifferent =
      !prevComputedDirtyRef.current ||
      computedDirtyRowIds.size !== dirtyRowIds.size ||
      Array.from(computedDirtyRowIds).some((id) => !dirtyRowIds.has(id)) ||
      Array.from(dirtyRowIds).some((id) => !computedDirtyRowIds.has(id));

    if (isDifferent) {
      setDirtyRowIds(computedDirtyRowIds);
    }
    prevComputedDirtyRef.current = computedDirtyRowIds;
  }

  // Mark a row as dirty (for paste operations)
  const markRowDirty = (rowId: string) => {
    setDirtyRowIds((prev) => new Set(prev).add(rowId));
  };

  // Clear dirty state for specific rows
  const clearDirtyRows = (rowIds: string[]) => {
    setDirtyRowIds((prev) => {
      const next = new Set(prev);
      rowIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  // Clear all dirty state
  const clearAllDirty = () => {
    setDirtyRowIds(new Set());
  };

  return {
    dirtyRowIds,
    markRowDirty,
    clearDirtyRows,
    clearAllDirty,
  };
}
