import type { TableRow } from '@domain/PasteTable/tableRow';

/**
 * Diffs map type: rowId → { colId → value }
 */
export type DiffsMap = Map<string, Record<string, string>>;

/**
 * Merge source rows with diffs to produce current display rows.
 * Pure function - no side effects.
 *
 * @param sourceRows - Clean rows from server
 * @param diffs - Map of rowId → changed cells
 * @returns Merged rows for display
 */
export function mergeSourceWithDiffs(
  sourceRows: TableRow[],
  diffs: DiffsMap,
): TableRow[] {
  return sourceRows.map((sourceRow) => {
    const rowDiffs = diffs.get(sourceRow.id);

    if (!rowDiffs) {
      // No changes for this row - return as-is
      return sourceRow;
    }

    // Merge diffs into cells
    return {
      ...sourceRow,
      cells: {
        ...sourceRow.cells,
        ...rowDiffs,
      },
    };
  });
}
