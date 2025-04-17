import type { TableColumn, TableRow } from '../../types';
import { generateRowId } from './rowCreation';

/**
 * Parse tab-separated values into a 2D array
 */
export function parseTsv(text: string): string[][] {
  return text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n') // Handle old Mac line endings
    .split('\n')
    .map((row) => row.split('\t'))
    .filter((row) => row.some((cell) => cell.trim() !== '')); // Filter empty rows
}

/**
 * Try to detect if the first row is a header row based on column labels
 */
export function detectHeaderRow(
  firstRow: string[],
  columns: TableColumn[],
): { hasHeaderRow: boolean; headerColumnMap: Record<number, string> } {
  const headerColumnMap: Record<number, string> = {};

  // Check if header row matches column labels
  const matchCount = firstRow.filter((cellValue, index) => {
    // Find a column with matching label
    const matchingColumn = columns.find(
      (col) => col.label.toLowerCase() === cellValue.trim().toLowerCase(),
    );

    if (matchingColumn) {
      // Store the mapping between column index and column ID
      headerColumnMap[index] = matchingColumn.id;
      return true;
    }
    return false;
  }).length;

  // If more than half the columns match, consider it a header row
  const hasHeaderRow =
    matchCount >= Math.min(firstRow.length / 2, columns.length / 2);

  return { hasHeaderRow, headerColumnMap };
}

/**
 * Convert TSV data to table rows
 */
export function convertTsvToRows(
  tsvData: string[][],
  columns: TableColumn[],
  hasHeaderRow: boolean,
  headerColumnMap: Record<number, string>,
): TableRow[] {
  // Skip the header row if detected
  const dataRows = hasHeaderRow ? tsvData.slice(1) : tsvData;

  return dataRows.map((cells) => {
    // Create a unique ID for each row
    const rowId = generateRowId();

    // Create a fresh cells object with each cell as a primitive value
    const cellsObj: Record<string, string> = {};

    // Initialize all columns with empty values
    columns.forEach((col) => {
      cellsObj[col.id] = '';
    });

    // If we have a header row, use the column mapping
    if (hasHeaderRow) {
      cells.forEach((cell, colIndex) => {
        const columnId = headerColumnMap[colIndex];
        if (columnId) {
          cellsObj[columnId] = String(cell.trim());
        }
      });
    } else {
      // No header row - map by position
      cells.forEach((cell, colIndex) => {
        if (columns[colIndex]) {
          cellsObj[columns[colIndex].id] = String(cell.trim());
        }
      });
    }

    return {
      id: rowId,
      cells: cellsObj,
    };
  });
}

/**
 * Try to parse JSON from pasted text
 */
export function tryParseJson(text: string): { isJson: boolean; jsonData: any } {
  let isJson = false;
  let jsonData = null;

  if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
    try {
      jsonData = JSON.parse(text.trim());
      isJson = true;
    } catch {
      // Continue with normal tab-separated parsing
    }
  }

  return { isJson, jsonData };
}

/**
 * Convert JSON data to a table row
 */
export function convertJsonToRow(
  jsonData: any,
  columns: TableColumn[],
): TableRow {
  // Create a new row with proper column mapping
  const cellsObj: Record<string, string> = {};

  // Initialize all columns with empty values first
  columns.forEach((col) => {
    cellsObj[col.id] = '';
  });

  // If the pasted JSON contains cell data (in any format), try to map it
  if (jsonData.cells) {
    // Special case: cells object has 'undefined' as a key (bug)
    // This happens when an object with improper column IDs is pasted
    if ('undefined' in jsonData.cells) {
      // Map to the first available column as a reasonable fallback
      if (columns.length > 0) {
        // Find the first column that seems most appropriate (the descriptor/main field)
        const targetColumnId = columns[0].id;
        cellsObj[targetColumnId] = String(jsonData.cells.undefined || '');
      }
    } else {
      // Normal case: map keys to columns if they match
      Object.entries(jsonData.cells).forEach(([key, value]) => {
        const matchingColumn = columns.find((col) => col.id === key);
        if (matchingColumn) {
          cellsObj[matchingColumn.id] = String(value || '');
        }
      });
    }
  }

  return {
    id: jsonData.id || jsonData.rowId || generateRowId(),
    cells: cellsObj,
  };
}
