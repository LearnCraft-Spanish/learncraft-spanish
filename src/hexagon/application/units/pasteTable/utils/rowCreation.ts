import type { TableColumn, TableRow } from '../../types';
import { GHOST_ROW_ID } from '../../types';

/**
 * Creates an empty ghost row with the given columns
 */
export const createGhostRow = (columns: TableColumn[]): TableRow => ({
  id: GHOST_ROW_ID,
  cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
});

/**
 * Generates a unique row ID based on current timestamp
 */
export const generateRowId = (): string =>
  `row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/**
 * Creates an empty row with all columns initialized
 */
export const createEmptyRow = (columns: TableColumn[]): TableRow => ({
  id: generateRowId(),
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
