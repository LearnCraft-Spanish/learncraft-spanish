import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import { GHOST_ROW_ID } from '@application/units/pasteTable/useCreateTable';
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
