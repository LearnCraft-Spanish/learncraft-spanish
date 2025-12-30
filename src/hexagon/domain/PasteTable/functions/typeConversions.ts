/**
 * Type conversion utilities
 * Convert between string (table) and typed (domain) representations
 */

import type { ColumnDefinition } from '@domain/PasteTable';

/**
 * Parse boolean from string (multiple formats)
 */
export function parseBoolean(
  value: string,
  format?: 'auto' | 'true-false' | 'yes-no' | '1-0' | 'y-n',
): boolean {
  const normalized = value.trim().toLowerCase();

  if (format === 'auto' || !format) {
    // Accept all formats
    return ['true', '1', 'yes', 'y'].includes(normalized);
  }

  // Format-specific parsing
  switch (format) {
    case 'true-false':
      return normalized === 'true';
    case 'yes-no':
      return normalized === 'yes';
    case '1-0':
      return normalized === '1';
    case 'y-n':
      return normalized === 'y';
  }
}

/**
 * Format boolean for table display (from domain entity)
 */
export function formatBooleanForTable(
  value: boolean,
  format?: 'auto' | 'true-false' | 'yes-no' | '1-0' | 'y-n',
): string {
  if (format === 'auto' || !format || format === 'true-false') {
    return value.toString();
  }

  switch (format) {
    case 'yes-no':
      return value ? 'yes' : 'no';
    case '1-0':
      return value ? '1' : '0';
    case 'y-n':
      return value ? 'y' : 'n';
    default:
      return value.toString();
  }
}

/**
 * Convert cell value based on column type
 * Normalizes string input according to column type rules
 */
export function convertCellValue(
  value: string,
  column: ColumnDefinition,
): string {
  switch (column.type) {
    case 'boolean':
      return parseBoolean(value, column.booleanFormat).toString();
    case 'number':
      return String(Number(value));
    case 'date':
      return normalizeDate(value);
    default:
      return value;
  }
}

/**
 * Normalize date string (for cell value storage)
 * Converts various input formats to a standard format for storage in TableRow
 */
export function normalizeDate(value: string): string {
  if (!value || value.trim() === '') {
    return '';
  }

  // Try to parse and normalize to ISO date format (YYYY-MM-DD)
  // This is a simple implementation - can be enhanced with date library
  const trimmed = value.trim();

  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Try other common formats and convert to ISO
  // MM/DD/YYYY -> YYYY-MM-DD
  const usFormat = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (usFormat) {
    const [, month, day, year] = usFormat;
    return `${year}-${month}-${day}`;
  }

  // DD-MM-YYYY -> YYYY-MM-DD
  const euFormat = /^(\d{2})-(\d{2})-(\d{4})$/.exec(trimmed);
  if (euFormat) {
    const [, day, month, year] = euFormat;
    return `${year}-${month}-${day}`;
  }

  // Try native Date parsing as fallback
  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // If parsing fails, return original (validation will catch it)
  return trimmed;
}
