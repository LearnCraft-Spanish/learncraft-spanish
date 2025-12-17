import type { TableColumn, TableRow } from '@domain/PasteTable/General';
import { GHOST_ROW_ID } from '@application/units/pasteTable/useCreateTable';
import { generateRowId } from '@domain/PasteTable/functions/rowId';

// Re-export for backward compatibility
export { generateRowId };

/**
 * Creates an empty row with all columns initialized
 */
export const createEmptyRow = (columns: TableColumn[]): TableRow => ({
  id: generateRowId(),
  cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
});

/**
 * Creates an empty ghost row with the given columns
 */
export const createGhostRow = (columns: TableColumn[]): TableRow => ({
  id: GHOST_ROW_ID,
  cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
});
