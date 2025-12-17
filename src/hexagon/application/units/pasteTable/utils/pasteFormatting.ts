import type { TableColumn, TableRow } from '@domain/PasteTable/General';
import type { ColumnDefinition } from '@domain/PasteTable/types';
import { generateRowId } from '@application/units/pasteTable/utils/rowCreation';
import { normalizeRowCells } from '@domain/PasteTable/functions/normalization';

/**
 * Detect if pasted text is CSV (comma-separated) or TSV (tab-separated)
 * CSV is detected if:
 * - Contains commas and no tabs, OR
 * - Contains quoted fields (indicates CSV format)
 */
export function detectDelimiter(text: string): 'csv' | 'tsv' {
  const hasTabs = text.includes('\t');
  const hasCommas = text.includes(',');
  const hasQuotes = text.includes('"');

  // If it has tabs, it's TSV
  if (hasTabs) {
    return 'tsv';
  }

  // If it has quotes (likely CSV with quoted fields), or commas without tabs, it's CSV
  if (hasQuotes || (hasCommas && !hasTabs)) {
    return 'csv';
  }

  // Default to TSV if ambiguous (no tabs, no commas, or just commas but no quotes)
  return 'tsv';
}

/**
 * Parse CSV with proper handling of quoted fields and escaped commas
 * Handles:
 * - Quoted fields: "Smith, John"
 * - Escaped quotes: "He said ""Hello"""
 * - Mixed quoted/unquoted fields
 */
export function parseCsv(text: string): string[][] {
  const lines: string[][] = [];
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const linesArray = normalized.split('\n');

  for (const line of linesArray) {
    if (line.trim() === '') continue; // Skip empty lines

    const cells: string[] = [];
    let currentCell = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote: ""
          currentCell += '"';
          i += 2; // Skip both quotes
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
          continue;
        }
      }

      if (char === ',' && !inQuotes) {
        // End of cell
        cells.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      }

      // Regular character
      currentCell += char;
      i++;
    }

    // Add the last cell
    cells.push(currentCell.trim());

    // Only add non-empty rows
    if (cells.some((cell) => cell !== '')) {
      lines.push(cells);
    }
  }

  return lines;
}

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
 * Parse delimited text (CSV or TSV) into a 2D array
 * Automatically detects format and parses accordingly
 */
export function parseDelimitedText(text: string): string[][] {
  const delimiter = detectDelimiter(text);
  return delimiter === 'csv' ? parseCsv(text) : parseTsv(text);
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
 * Convert parsed delimited data (CSV or TSV) to table rows
 * Normalizes cell values to canonical format based on column types
 *
 * @param parsedRows - 2D array of parsed data: [row][cell]
 * @param columns - Column definitions for mapping and normalization
 * @param hasHeaderRow - Whether the first row is a header row
 * @param headerColumnMap - Map of column index to column ID (from header row)
 * @returns Array of TableRow objects with normalized cell values
 */
export function convertTsvToRows(
  parsedRows: string[][], // [rowIndex][cellIndex] = cellValue
  columns: TableColumn[],
  hasHeaderRow: boolean,
  headerColumnMap: Record<number, string>,
): TableRow[] {
  // Skip the header row if detected
  const dataRows = hasHeaderRow ? parsedRows.slice(1) : parsedRows;

  // Extract domain columns (without UI properties) for normalization
  const domainColumns: ColumnDefinition[] = columns.map((col) => {
    const { label, width, placeholder, ...domainCol } = col;
    return domainCol;
  });

  return dataRows.map((rowCells) => {
    // rowCells is an array of cell values: ['value1', 'value2', ...]
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
      rowCells.forEach((cellValue, colIndex) => {
        const columnId = headerColumnMap[colIndex];
        if (columnId) {
          cellsObj[columnId] = String(cellValue.trim());
        }
      });
    } else {
      // No header row - map by position
      rowCells.forEach((cellValue, colIndex) => {
        if (columns[colIndex]) {
          cellsObj[columns[colIndex].id] = String(cellValue.trim());
        }
      });
    }

    // Normalize cell values to canonical format
    const normalizedCells = normalizeRowCells(cellsObj, domainColumns);

    return {
      id: rowId,
      cells: normalizedCells,
    };
  });
}
