import type { TableRow } from '@domain/PasteTable/tableRow';
import { cellsEqual } from '@domain/PasteTable/functions/rowComparison';
import { useMemo } from 'react';

interface UseDirtyStateTrackingProps {
  rows: TableRow[];
  cleanRows: TableRow[];
  idColumnId: string;
  /** Column IDs to compare (defaults to all columns) */
  editableColumnIds?: string[];
}

/**
 * Hook to track dirty state by comparing current rows to clean rows.
 * Returns a pure derivation - no manual marking needed.
 */
export function useDirtyStateTracking({
  rows,
  cleanRows,
  idColumnId,
  editableColumnIds,
}: UseDirtyStateTrackingProps) {
  // Pure derivation: compute dirty state from row comparison
  const dirtyRowIds = useMemo(() => {
    const dirty = new Set<string>();

    for (const currentRow of rows) {
      const cleanRow = cleanRows.find(
        (cr) =>
          cr.id === currentRow.id ||
          Number(cr.cells[idColumnId]) === Number(currentRow.cells[idColumnId]),
      );

      if (
        cleanRow &&
        !cellsEqual(currentRow.cells, cleanRow.cells, editableColumnIds)
      ) {
        dirty.add(currentRow.id);
      }
    }

    return dirty;
  }, [rows, cleanRows, idColumnId, editableColumnIds]);

  return { dirtyRowIds };
}
