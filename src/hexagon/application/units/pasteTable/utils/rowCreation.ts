import type {
  TableColumn,
  TableRow,
} from '@application/units/pasteTable/types';
import { GHOST_ROW_ID } from '@application/units/pasteTable/types';

// Counter for generating truly unique row IDs
let rowIdCounter = 0;

/**
 * Reset the row ID counter - mainly for testing purposes
 */
export const resetRowIdCounter = (): void => {
  rowIdCounter = 0;
};

/**
 * Generates a guaranteed unique row ID by combining timestamp, counter and random value
 */
export const generateRowId = (): string => {
  // Increment the counter first to ensure uniqueness even with same timestamp
  rowIdCounter += 1;

  // Create a unique ID using timestamp, counter and random number
  return `row-${Date.now()}-${rowIdCounter}-${Math.floor(Math.random() * 1000)}`;
};

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

/**
 * Converts typed data to table rows
 */
export const convertDataToRows = <T>(
  data: T[],
  columns: TableColumn[],
): TableRow[] => {
  return data.map((item) => {
    const cells: Record<string, string> = {};
    columns.forEach((column) => {
      const key = column.id as keyof T;
      const value = item[key];
      cells[column.id] = value !== undefined ? String(value) : '';
    });
    return {
      id: generateRowId(),
      cells,
    };
  });
};
