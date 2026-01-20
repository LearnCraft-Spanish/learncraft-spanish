/**
 * Date conversion utilities
 * Handle parsing, formatting, and validation of dates
 */

import type { ColumnDefinition, DateFormatConfig } from '@domain/PasteTable';
import { isDateColumn } from '@domain/PasteTable';

/**
 * Parse date string from table input
 * Accepts multiple formats, returns Date object or ISO string
 */
export function parseDateFromTable(
  value: string,
  dateFormat?: DateFormatConfig,
): Date | string | undefined {
  // Return type is Date | string | undefined (not number)
  // Timestamp format returns number, but we'll convert it to string for consistency
  if (!value || value.trim() === '') {
    return undefined;
  }

  const normalized = value.trim();
  const formats = dateFormat?.inputFormats || [
    'YYYY-MM-DD', // ISO date (2024-01-15)
    'MM/DD/YYYY', // US format (01/15/2024)
    'DD-MM-YYYY', // European format (15-01-2024)
    'YYYY/MM/DD', // Alternative ISO (2024/01/15)
  ];

  // Try parsing with each format
  for (const format of formats) {
    const parsed = tryParseDate(normalized, format);
    if (parsed) {
      // Convert to desired output format
      const output = formatDateOutput(
        parsed,
        dateFormat?.outputFormat || 'iso-date',
      );
      // Convert timestamp to string for consistency
      if (typeof output === 'number') {
        return String(output);
      }
      return output;
    }
  }

  // If no format matched, try native Date parsing as fallback
  const nativeDate = new Date(normalized);
  if (!Number.isNaN(nativeDate.getTime())) {
    const output = formatDateOutput(
      nativeDate,
      dateFormat?.outputFormat || 'iso-date',
    );
    // Convert timestamp to string for consistency
    if (typeof output === 'number') {
      return String(output);
    }
    return output;
  }

  throw new Error(`Invalid date format: ${normalized}`);
}

/**
 * Try to parse a date string with a specific format
 */
function tryParseDate(value: string, format: string): Date | null {
  // Implementation with manual parsing for common formats
  if (format === 'YYYY-MM-DD') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match.map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        return date;
      }
    }
  }

  if (format === 'MM/DD/YYYY') {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
      const [, month, day, year] = match.map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        return date;
      }
    }
  }

  if (format === 'DD-MM-YYYY') {
    const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) {
      const [, day, month, year] = match.map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        return date;
      }
    }
  }

  if (format === 'YYYY/MM/DD') {
    const match = value.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
    if (match) {
      const [, year, month, day] = match.map(Number);
      const date = new Date(year, month - 1, day);
      if (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      ) {
        return date;
      }
    }
  }

  return null;
}

/**
 * Format date to output format (for domain entity)
 */
function formatDateOutput(
  date: Date,
  outputFormat: 'iso' | 'iso-date' | 'timestamp' | 'Date' = 'iso-date',
): Date | string | number {
  switch (outputFormat) {
    case 'Date':
      return date; // Return Date object
    case 'iso':
      return date.toISOString(); // Full ISO datetime
    case 'iso-date':
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'timestamp':
      return date.getTime(); // Unix timestamp
  }
}

/**
 * Format date for table display (from domain entity)
 */
export function formatDateForTable(
  value: Date | string | number | undefined,
  dateFormat?: DateFormatConfig,
): string {
  if (!value) {
    return '';
  }

  // Convert to Date object
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else if (typeof value === 'number') {
    date = new Date(value);
  } else {
    return '';
  }

  // Validate date
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  // Format according to display format or default
  const displayFormat = dateFormat?.displayFormat || 'YYYY-MM-DD';
  return formatDateDisplay(date, displayFormat);
}

/**
 * Format date for UI display
 * Uses UTC to avoid timezone issues - ISO under the hood, local only at display
 */
function formatDateDisplay(date: Date, format: string): string {
  // Use UTC methods to avoid timezone shifts
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  // Manual formatting for common formats
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }

  if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  }

  if (format === 'DD-MM-YYYY') {
    return `${day}-${month}-${year}`;
  }

  // Default to ISO date format
  return date.toISOString().split('T')[0];
}

/**
 * Validate date string
 * Returns error message if invalid, null if valid
 *
 * @param value - The date string to validate
 * @param column - Must be a DateColumnDefinition (type guard ensures this)
 */
export function validateDate(
  value: string,
  column: ColumnDefinition,
): string | null {
  // Type guard to ensure we have a date column
  if (!isDateColumn(column)) {
    return null; // Not a date column, skip validation
  }

  if (column.required && (!value || value.trim() === '')) {
    return `${column.id} is required`;
  }

  if (!value || value.trim() === '') {
    return null; // Empty is valid if not required
  }

  try {
    parseDateFromTable(value, column.dateFormat);
    return null; // Valid
  } catch {
    const formats = column.dateFormat?.inputFormats?.join(', ') || 'YYYY-MM-DD';
    return `Invalid date format. Expected: ${formats}`;
  }
}
