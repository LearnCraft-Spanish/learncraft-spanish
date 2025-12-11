/**
 * Cell value normalization
 * Ensures all cell values are in canonical string format based on column type
 */

import type {
  BooleanColumnDefinition,
  ColumnDefinition,
  DateColumnDefinition,
  NumberColumnDefinition,
  SelectColumnDefinition,
  TextColumnDefinition,
} from '@domain/PasteTable/types';
import {
  formatBooleanForTable,
  normalizeDate,
  parseBoolean,
} from '@domain/PasteTable/functions/typeConversions';

/**
 * Normalize a cell value to its canonical string representation
 * This ensures consistent format regardless of input source (paste, edit, domain entity)
 *
 * Uses function overloads for better type safety based on column type
 */
export function normalizeCellValue(
  value: string,
  column: TextColumnDefinition,
): string;
export function normalizeCellValue(
  value: string,
  column: NumberColumnDefinition,
): string;
export function normalizeCellValue(
  value: string,
  column: BooleanColumnDefinition,
): string;
export function normalizeCellValue(
  value: string,
  column: DateColumnDefinition,
): string;
export function normalizeCellValue(
  value: string,
  column: SelectColumnDefinition,
): string;
export function normalizeCellValue(
  value: string,
  column: ColumnDefinition,
): string;
export function normalizeCellValue(
  value: string,
  column: ColumnDefinition,
): string {
  // Empty values stay empty
  if (!value || value.trim() === '') {
    return '';
  }

  const trimmed = value.trim();

  switch (column.type) {
    case 'boolean': {
      // Normalize to canonical boolean format
      const boolValue = parseBoolean(trimmed, column.booleanFormat);
      // Use the column's format preference, defaulting to 'true-false'
      const format = column.booleanFormat || 'true-false';
      return formatBooleanForTable(boolValue, format);
    }

    case 'number': {
      // Normalize number to canonical format
      const numValue = Number(trimmed);
      if (Number.isNaN(numValue)) {
        // Invalid number - return as-is (validation will catch it)
        return trimmed;
      }

      // Check if it's an integer (no decimal part)
      if (Number.isInteger(numValue)) {
        return String(Math.floor(numValue));
      }

      // For decimals, remove trailing zeros
      return String(numValue).replace(/\.?0+$/, '');
    }

    case 'date': {
      // Normalize to ISO date format (YYYY-MM-DD)
      return normalizeDate(trimmed);
    }

    case 'select': {
      // For select, ensure value matches one of the options (case-insensitive)
      const matchingOption = column.options.find(
        (opt) => opt.value.toLowerCase() === trimmed.toLowerCase(),
      );
      if (matchingOption) {
        return matchingOption.value; // Return canonical option value
      }
      // If no match, return trimmed (validation will catch invalid selection)
      return trimmed;
    }

    case 'text':
    default: {
      // Text: trim whitespace, but preserve internal spaces
      return trimmed;
    }
  }
}

/**
 * Normalize all cells in a row to canonical format
 */
export function normalizeRowCells(
  cells: Record<string, string>,
  columns: ColumnDefinition[],
): Record<string, string> {
  const normalized: Record<string, string> = {};

  columns.forEach((col) => {
    const value = cells[col.id] || '';
    normalized[col.id] = normalizeCellValue(value, col);
  });

  return normalized;
}

/**
 * Normalize a number string to canonical format
 * Handles integers, decimals, and removes unnecessary precision
 */
export function normalizeNumber(value: string): string {
  if (!value || value.trim() === '') {
    return '';
  }

  const trimmed = value.trim();
  const numValue = Number(trimmed);

  if (Number.isNaN(numValue)) {
    return trimmed; // Invalid - return as-is
  }

  // Integer: return without decimal
  if (Number.isInteger(numValue)) {
    return String(Math.floor(numValue));
  }

  // Decimal: remove trailing zeros
  return String(numValue).replace(/\.?0+$/, '');
}

/**
 * Normalize a boolean string to canonical format
 * Converts various formats to the specified canonical format
 */
export function normalizeBoolean(
  value: string,
  format: 'auto' | 'true-false' | 'yes-no' | '1-0' | 'y-n' = 'true-false',
): string {
  if (!value || value.trim() === '') {
    return '';
  }

  const boolValue = parseBoolean(value, format);
  return formatBooleanForTable(boolValue, format);
}

/**
 * Normalize a text string
 * Trims whitespace, handles empty strings
 */
export function normalizeText(value: string): string {
  if (!value) {
    return '';
  }
  return value.trim();
}
