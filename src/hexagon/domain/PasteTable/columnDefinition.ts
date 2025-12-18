/**
 * Column Definition
 *
 * Pure domain type - defines WHAT the data IS.
 * No display/presentation concerns.
 */

import type { z } from 'zod';

/**
 * Supported cell types
 */
export type CellType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multi-select'
  | 'date'
  | 'custom';

/**
 * Options for select-type cells
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Date format configuration
 */
export interface DateFormatConfig {
  inputFormats?: string[];
  outputFormat?: 'iso' | 'iso-date' | 'timestamp' | 'Date';
  displayFormat?: string;
}

/**
 * Boolean format for parsing/display
 */
export type BooleanFormat = 'auto' | 'true-false' | 'yes-no' | '1-0' | 'y-n';

/**
 * Column definition - defines what the data IS
 */
export interface ColumnDefinition {
  /** Unique identifier - maps to domain model field name */
  id: string;
  /** The type of cell */
  type: CellType;
  /** Can user modify? (default: true) */
  editable?: boolean;
  /** Is this field required? */
  required?: boolean;
  /** Is this computed/not persisted? */
  derived?: boolean;
  /** Zod schema for validation */
  schema?: z.ZodType<unknown, z.ZodTypeDef, unknown>;

  // Type-specific options
  /** For select/multi-select: options */
  options?: SelectOption[];
  /** For multi-select: separator (default: ',') */
  separator?: string;
  /** For number: min constraint */
  min?: number;
  /** For number: max constraint */
  max?: number;
  /** For boolean: format */
  booleanFormat?: BooleanFormat;
  /** For date: format config */
  dateFormat?: DateFormatConfig;
}

/**
 * Check if a column is editable
 */
export function isColumnEditable(col: ColumnDefinition): boolean {
  if (col.derived) return false;
  return col.editable !== false;
}

/**
 * Check if a column is derived
 */
export function isColumnDerived(col: ColumnDefinition): boolean {
  return col.derived === true;
}

/**
 * Get only editable columns
 */
export function getEditableColumns(
  columns: ColumnDefinition[],
): ColumnDefinition[] {
  return columns.filter(isColumnEditable);
}

// Type guards
export function isNumberColumn(col: ColumnDefinition): boolean {
  return col.type === 'number';
}

export function isBooleanColumn(col: ColumnDefinition): boolean {
  return col.type === 'boolean';
}

export function isDateColumn(col: ColumnDefinition): boolean {
  return col.type === 'date';
}

export function isSelectColumn(col: ColumnDefinition): boolean {
  return col.type === 'select';
}

export function isMultiSelectColumn(col: ColumnDefinition): boolean {
  return col.type === 'multi-select';
}
