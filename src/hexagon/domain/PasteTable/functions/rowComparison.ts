/**
 * Row comparison utilities
 * Compare rows and cells for change tracking
 */

import type { TableRow } from '@domain/PasteTable';

/**
 * Deep equality check for cells
 * @param columnIds - If provided, only compare these columns
 */
export function cellsEqual(
  cells1: Record<string, string>,
  cells2: Record<string, string>,
  columnIds?: string[],
): boolean {
  const keysToCompare = columnIds ?? Object.keys(cells1);

  // If no columnIds filter, also check key count matches
  if (!columnIds) {
    const keys2 = Object.keys(cells2);
    if (keysToCompare.length !== keys2.length) {
      return false;
    }
  }

  for (const key of keysToCompare) {
    if (cells1[key] !== cells2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Deep equality check for rows
 */
export function rowsEqual(row1: TableRow, row2: TableRow): boolean {
  if (row1.id !== row2.id) {
    return false;
  }

  return cellsEqual(row1.cells, row2.cells);
}

/**
 * Check if a row has changed from original
 */
export function hasRowChanged(
  currentRow: TableRow,
  originalRow: TableRow,
): boolean {
  return !cellsEqual(currentRow.cells, originalRow.cells);
}

/**
 * Find all dirty rows (rows that have changed)
 */
export function findDirtyRows(
  currentRows: TableRow[],
  originalRows: TableRow[],
): Set<string> {
  const dirtyIds = new Set<string>();

  currentRows.forEach((row) => {
    const original = originalRows.find((r) => r.id === row.id);
    if (original && hasRowChanged(row, original)) {
      dirtyIds.add(row.id);
    }
  });

  return dirtyIds;
}
