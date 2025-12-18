import type { TableRow } from '@domain/PasteTable';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Diffs map: rowId → { colId → value }
 */
export type DiffsMap = Map<string, Record<string, string>>;

export interface UseDiffsOptions {
  /** Source rows to compare against (from server) */
  sourceRows: TableRow[];
  /** Column IDs to track (editable, non-derived) */
  editableColumnIds: string[];
}

export interface UseDiffsResult {
  /** Current diffs */
  diffs: DiffsMap;
  /** Set of row IDs that have changes */
  dirtyRowIds: Set<string>;
  /** Update a single cell diff - auto-reverts if matches source */
  updateDiff: (rowId: string, colId: string, value: string) => void;
  /** Compute diffs from full rows (for paste operations) */
  setRowsViaDiffs: (newRows: TableRow[]) => void;
  /** Clear all diffs (discard changes) */
  clearDiffs: () => void;
}

/**
 * Hook to manage diffs-only state for edit tables.
 * Only stores what changed from source, not full row state.
 */
export function useDiffs({
  sourceRows,
  editableColumnIds,
}: UseDiffsOptions): UseDiffsResult {
  const [diffs, setDiffs] = useState<DiffsMap>(new Map());

  // Build lookup for source values
  const sourceValueLookup = useMemo(() => {
    const lookup = new Map<string, Record<string, string>>();
    for (const row of sourceRows) {
      lookup.set(row.id, row.cells);
    }
    return lookup;
  }, [sourceRows]);

  // Derive dirty row IDs from diffs keys
  const dirtyRowIds = useMemo(() => new Set(diffs.keys()), [diffs]);

  // Update a single cell - auto-reverts if matches source
  const updateDiff = useCallback(
    (rowId: string, colId: string, value: string) => {
      const sourceCells = sourceValueLookup.get(rowId);
      const sourceValue = sourceCells?.[colId] ?? '';

      setDiffs((prev) => {
        const next = new Map(prev);
        const rowDiffs = { ...prev.get(rowId) };

        if (value === sourceValue) {
          // Matches source - remove from diffs
          delete rowDiffs[colId];
          if (Object.keys(rowDiffs).length === 0) {
            next.delete(rowId);
          } else {
            next.set(rowId, rowDiffs);
          }
        } else {
          // Different from source - add to diffs
          rowDiffs[colId] = value;
          next.set(rowId, rowDiffs);
        }

        return next;
      });
    },
    [sourceValueLookup],
  );

  // Compute diffs from full rows (for paste operations)
  const setRowsViaDiffs = useCallback(
    (newRows: TableRow[]) => {
      const newDiffs: DiffsMap = new Map();

      for (const row of newRows) {
        const sourceCells = sourceValueLookup.get(row.id);
        if (!sourceCells) continue; // Skip rows not in source (shouldn't happen in edit mode)

        const rowDiffs: Record<string, string> = {};

        for (const colId of editableColumnIds) {
          const newValue = row.cells[colId] ?? '';
          const sourceValue = sourceCells[colId] ?? '';

          if (newValue !== sourceValue) {
            rowDiffs[colId] = newValue;
          }
        }

        if (Object.keys(rowDiffs).length > 0) {
          newDiffs.set(row.id, rowDiffs);
        }
      }

      setDiffs(newDiffs);
    },
    [sourceValueLookup, editableColumnIds],
  );

  // Clear all diffs
  const clearDiffs = useCallback(() => {
    setDiffs(new Map());
  }, []);

  // Auto-cleanup: when source changes, prune diffs that now match source
  useEffect(() => {
    setDiffs((prev) => {
      if (prev.size === 0) return prev;

      const next = new Map(prev);
      let changed = false;

      for (const [rowId, rowDiffs] of prev) {
        const sourceCells = sourceValueLookup.get(rowId);
        if (!sourceCells) {
          // Row no longer exists in source - remove diffs
          next.delete(rowId);
          changed = true;
          continue;
        }

        const cleanedRowDiffs: Record<string, string> = {};
        for (const [colId, diffValue] of Object.entries(rowDiffs)) {
          const sourceValue = sourceCells[colId] ?? '';
          if (diffValue !== sourceValue) {
            // Still different - keep the diff
            cleanedRowDiffs[colId] = diffValue;
          } else {
            changed = true;
          }
        }

        if (Object.keys(cleanedRowDiffs).length === 0) {
          next.delete(rowId);
          changed = true;
        } else if (
          Object.keys(cleanedRowDiffs).length !== Object.keys(rowDiffs).length
        ) {
          next.set(rowId, cleanedRowDiffs);
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [sourceValueLookup]);

  return {
    diffs,
    dirtyRowIds,
    updateDiff,
    setRowsViaDiffs,
    clearDiffs,
  };
}

