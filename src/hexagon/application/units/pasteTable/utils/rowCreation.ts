import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { generateRowId } from '@domain/PasteTable/functions/rowId';

// Re-export for backward compatibility
export { generateRowId };

/**
 * Creates an empty row with all columns initialized
 */
export const createEmptyRow = (columns: ColumnDefinition[]): TableRow => ({
  id: generateRowId(),
  cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
});

/**
 * Creates an empty ghost row with the given columns
 */
export const createGhostRow = (columns: ColumnDefinition[]): TableRow => ({
  id: GHOST_ROW_ID,
  cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
});
/**
 * Converts typed data to table rows
 */
export const convertDataToRows = <T>(
  data: T[],
  columns: ColumnDefinition[],
): TableRow[] => {
  return data.map((item) => {
    const cells: Record<string, string> = {};
    columns.forEach((column) => {
      const key = column.id as keyof T;
      const value = item[key];
      cells[column.id] =
        value === undefined || value === null ? '' : String(value);
    });
    return {
      id: generateRowId(),
      cells,
    };
  });
};
