/**
 * Domain types for PasteTable system
 * Separated from interface concerns
 */

import type { z } from 'zod';

/**
 * Supported cell input types
 */
export type CellType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'date'
  | 'boolean'
  | 'read-only';

/**
 * Options for select-type cells
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Date format configuration for date columns
 */
export interface DateFormatConfig {
  /** Input formats to accept (for parsing) */
  inputFormats?: string[]; // e.g., ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY']
  /** Output format (for display/storage) */
  outputFormat?: 'iso' | 'iso-date' | 'timestamp' | 'Date'; // 'iso-date' = YYYY-MM-DD
  /** Display format (for UI) */
  displayFormat?: string; // e.g., 'MM/DD/YYYY' for UI display
}

/**
 * Base column definition - shared properties
 */
interface BaseColumnDefinition {
  /** Unique identifier (maps to domain model field) */
  id: string;
  /** Can this field be modified? (default: true) */
  editable?: boolean;
  /** Is this field required? */
  required?: boolean;
  /** Zod schema for column-level validation */
  schema?: z.ZodType<unknown, any, unknown>;
}

/**
 * Read-only column definition
 */
export interface ReadOnlyColumnDefinition extends BaseColumnDefinition {
  type: 'read-only';
}
/**
 * Text column definition
 */
export interface TextColumnDefinition extends BaseColumnDefinition {
  type: 'text';
}

/**
 * Number column definition
 */
export interface NumberColumnDefinition extends BaseColumnDefinition {
  type: 'number';
  /** Minimum value constraint */
  min?: number;
  /** Maximum value constraint */
  max?: number;
}

/**
 * Boolean column definition
 */
export interface BooleanColumnDefinition extends BaseColumnDefinition {
  type: 'boolean';
  /** Boolean parsing/formatting format */
  booleanFormat?: 'auto' | 'true-false' | 'yes-no' | '1-0' | 'y-n';
}

/**
 * Date column definition
 */
export interface DateColumnDefinition extends BaseColumnDefinition {
  type: 'date';
  /** Date format configuration */
  dateFormat?: DateFormatConfig;
}

/**
 * Select column definition (single choice)
 */
export interface SelectColumnDefinition extends BaseColumnDefinition {
  type: 'select';
  /** Valid choices for select */
  options: SelectOption[]; // Required for select type
}

/**
 * Multi-select column definition (multiple choice)
 */
export interface MultiSelectColumnDefinition extends BaseColumnDefinition {
  type: 'multi-select';
  /** Valid choices for multi-select */
  options: SelectOption[]; // Required for multi-select type
  /** Separator for storing multiple values in cell (default: ',') */
  separator?: string; // Default: ','
}

/**
 * Type-specific column definitions using discriminated unions
 */
export type ColumnDefinition =
  | ReadOnlyColumnDefinition
  | TextColumnDefinition
  | NumberColumnDefinition
  | BooleanColumnDefinition
  | DateColumnDefinition
  | SelectColumnDefinition
  | MultiSelectColumnDefinition;

/**
 * Type guard functions for column definitions
 */
export function isTextColumn(
  col: ColumnDefinition,
): col is TextColumnDefinition {
  return col.type === 'text';
}

export function isNumberColumn(
  col: ColumnDefinition,
): col is NumberColumnDefinition {
  return col.type === 'number';
}

export function isBooleanColumn(
  col: ColumnDefinition,
): col is BooleanColumnDefinition {
  return col.type === 'boolean';
}

export function isDateColumn(
  col: ColumnDefinition,
): col is DateColumnDefinition {
  return col.type === 'date';
}

export function isSelectColumn(
  col: ColumnDefinition,
): col is SelectColumnDefinition {
  return col.type === 'select';
}

export function isMultiSelectColumn(
  col: ColumnDefinition,
): col is MultiSelectColumnDefinition {
  return col.type === 'multi-select';
}

export function isReadOnlyColumn(
  col: ColumnDefinition,
): col is ReadOnlyColumnDefinition {
  return col.type === 'read-only';
}

/**
 * Interface column display config - pure presentation
 * No business logic
 */
export interface ColumnDisplayConfig {
  /** Maps to ColumnDefinition.id */
  id: string;
  /** Human-readable label for headers/ARIA */
  label: string;
  /** CSS width (e.g., '1fr', '200px', '20%') */
  width?: string;
  /** Placeholder text for inputs */
  placeholder?: string;
}

/**
 * Combined column definition (at application boundary)
 * Convenience type that combines domain + interface
 * Uses intersection type to work with discriminated union
 */
export type TableColumn = ColumnDefinition & {
  // Interface concerns added
  label: string;
  width?: string;
  placeholder?: string;
};

/**
 * Core data structure for the table
 */
export interface TableData {
  /** Array of table rows */
  rows: TableRow[];
}

/**
 * Represents a single row in the table
 */
export interface TableRow {
  /** Unique identifier for the row */
  id: string;
  /** Map of column IDs to cell values (all strings) */
  cells: Record<string, string>;
}

/**
 * Validation result object
 */
export interface ValidationState {
  /** Whether all rows pass validation */
  isValid: boolean;
  /** Map of row IDs to their validation errors */
  errors: Record<string, Record<string, string>>; // rowId -> { columnId -> errorMessage }
}
