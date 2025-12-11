/**
 * Validation utilities
 * Pure functions for validating table rows
 */

import type {
  TableRow,
  ValidationState,
  ColumnDefinition,
  NumberColumnDefinition,
} from '@domain/PasteTable/types';
import { isNumberColumn } from '@domain/PasteTable/types';

/**
 * Validate a single row
 * Returns map of columnId -> errorMessage
 */
export function validateRow<T>(
  row: TableRow,
  validateFn: (row: T) => Record<string, string>,
): Record<string, string> {
  return validateFn(row.cells as T);
}

/**
 * Compute validation state for all rows
 */
export function computeValidationState<T>(
  rows: TableRow[],
  validateRow: (row: T) => Record<string, string>,
  excludeRowIds?: Set<string>, // e.g., exclude ghost row
): ValidationState {
  const errors: Record<string, Record<string, string>> = {};
  let isValid = true;

  rows.forEach((row) => {
    if (excludeRowIds?.has(row.id)) return;

    const rowErrors = validateRow(row.cells as T);
    if (Object.keys(rowErrors).length > 0) {
      errors[row.id] = rowErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
}

/**
 * Validate a single cell value against column definition
 * Uses type guards for type-safe access to type-specific properties
 */
export function validateCell(
  value: string,
  column: ColumnDefinition,
): string | null {
  // Required check
  if (column.required && (!value || value.trim() === '')) {
    return `${column.id} is required`;
  }

  // Type-specific validation with type guards
  if (isNumberColumn(column)) {
    const numValue = Number(value);
    if (Number.isNaN(numValue)) {
      return `${column.id} must be a number`;
    }
    if (column.min !== undefined && numValue < column.min) {
      return `${column.id} must be at least ${column.min}`;
    }
    if (column.max !== undefined && numValue > column.max) {
      return `${column.id} must be at most ${column.max}`;
    }
  }

  // Custom validator
  if (column.validate) {
    return column.validate(value);
  }

  return null; // Valid
}

