import type { TableRow } from '@domain/PasteTable';
import { useCallback, useMemo, useState } from 'react';

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
  const [diffs, setDiffs] = useState<DiffsMap>(() => new Map());

  // Build lookup for source values
  const sourceValueLookup = useMemo(() => {
    const lookup = new Map<string, Record<string, string>>();
    for (const row of sourceRows) {
      lookup.set(row.id, row.cells);
    }
    return lookup;
  }, [sourceRows]);

  // Derive cleaned diffs: prune diffs that now match source (when source changes)
  // This is pure derivation - no useEffect, no setState
  const cleanedDiffs = useMemo(() => {
    if (diffs.size === 0) return diffs;

    const next = new Map<string, Record<string, string>>();

    for (const [rowId, rowDiffs] of diffs) {
      const sourceCells = sourceValueLookup.get(rowId);
      if (!sourceCells) {
        // Row no longer exists in source - skip (don't include in cleaned diffs)
        continue;
      }

      const cleanedRowDiffs: Record<string, string> = {};
      for (const [colId, diffValue] of Object.entries(rowDiffs)) {
        const sourceValue = sourceCells[colId] ?? '';
        if (diffValue !== sourceValue) {
          // Still different from source - keep the diff
          cleanedRowDiffs[colId] = diffValue;
        }
        // If matches source, don't include (auto-cleaned)
      }

      if (Object.keys(cleanedRowDiffs).length > 0) {
        next.set(rowId, cleanedRowDiffs);
      }
    }

    return next;
  }, [diffs, sourceValueLookup]);

  // Derive dirty row IDs from cleaned diffs keys
  const dirtyRowIds = useMemo(
    () => new Set(cleanedDiffs.keys()),
    [cleanedDiffs],
  );

  // Update a single cell - auto-reverts if matches source
  const updateDiff = useCallback(
    (rowId: string, colId: string, value: string) => {
      const sourceCells = sourceValueLookup.get(rowId);
      const sourceValue = sourceCells?.[colId] ?? '';

      // Start from cleaned diffs (current cleaned state), not raw diffs
      const next = new Map(cleanedDiffs);
      const rowDiffs = { ...cleanedDiffs.get(rowId) };

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

      setDiffs(next);
    },
    [sourceValueLookup, cleanedDiffs],
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

  return {
    diffs: cleanedDiffs, // Return cleaned diffs, not raw diffs
    dirtyRowIds,
    updateDiff,
    setRowsViaDiffs,
    clearDiffs,
  };
}
