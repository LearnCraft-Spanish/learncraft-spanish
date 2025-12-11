import type { TableRow } from '@domain/PasteTable/types';
import { useCallback } from 'react';

interface UseCleanStateSyncProps {
  cleanRows: TableRow[];
  rows: TableRow[];
  dirtyRowIds: Set<string>;
  idColumnId: string;
  setRows: (rows: TableRow[] | ((prev: TableRow[]) => TableRow[])) => void;
}

/**
 * Hook to sync non-dirty rows to clean state when sourceData updates
 * Preserves user edits (dirty rows) while updating clean rows
 */
export function useCleanStateSync({
  cleanRows,
  rows,
  dirtyRowIds,
  idColumnId,
  setRows,
}: UseCleanStateSyncProps) {
  // Sync function to update non-dirty rows when cleanRows changes
  // Called when React Query updates sourceData
  const syncRowsToCleanState = useCallback(() => {
    if (cleanRows.length === 0 || rows.length === 0) return;

    setRows((currentRows) => {
      const updatedRows = currentRows.map((currentRow) => {
        // If row is dirty, keep current state (user's edits)
        if (dirtyRowIds.has(currentRow.id)) {
          return currentRow;
        }

        // If row is not dirty, update to match cleanRows
        const cleanRow = cleanRows.find(
          (cr) =>
            cr.id === currentRow.id ||
            // Match by domain ID if row IDs don't match
            Number(cr.cells[idColumnId]) ===
              Number(currentRow.cells[idColumnId]),
        );

        return cleanRow || currentRow;
      });

      // Add any new rows from cleanRows that don't exist in currentRows
      const currentRowIds = new Set(updatedRows.map((r) => r.id));
      const newRows = cleanRows.filter((cr) => !currentRowIds.has(cr.id));

      return [...updatedRows, ...newRows];
    });
  }, [cleanRows, rows.length, dirtyRowIds, idColumnId, setRows]);

  return {
    syncRowsToCleanState,
  };
}
