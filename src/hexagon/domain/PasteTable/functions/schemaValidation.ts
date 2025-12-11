/**
 * Schema-based validation utilities
 * Generate validation functions from Zod schemas
 * 
 * Validation operates on normalized, typed domain entities (not raw string cells).
 * The flow is: TableRow (strings) → normalize → map to domain entity → validate against schema
 */

import { z } from 'zod';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable/types';
import { mapTableRowToDomain } from '@domain/PasteTable/functions/mappers';
import { normalizeRowCells } from '@domain/PasteTable/functions/normalization';

/**
 * Generate a validateRow function from column schemas
 * Validates each column independently on the normalized, typed domain entity
 */
export function createValidateRowFromColumnSchemas<T extends Record<string, unknown>>(
  columns: ColumnDefinition[],
): (row: TableRow) => Record<string, string> {
  return (row: TableRow) => {
    const errors: Record<string, string> = {};

    // First normalize the row cells to canonical string format
    const normalizedCells = normalizeRowCells(row.cells, columns);
    const normalizedRow: TableRow = { ...row, cells: normalizedCells };

    // Map to typed domain entity (this converts strings to proper types)
    const domainEntity = mapTableRowToDomain<T>(normalizedRow, columns);

    // Validate each column with its schema
    columns.forEach((column) => {
      // Skip if no schema
      if (!column.schema) return;

      const value = (domainEntity as Record<string, unknown>)[column.id];

      try {
        // Validate the typed value against the schema
        column.schema.parse(value);
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Return the first error message
          const firstError = error.errors[0];
          errors[column.id] = firstError
            ? `${column.id}: ${firstError.message}`
            : `${column.id} is invalid`;
        } else {
          errors[column.id] = `${column.id} is invalid`;
        }
      }
    });

    return errors;
  };
}

/**
 * Generate a validateRow function from a full row Zod schema
 * Validates the entire row as a single entity after normalization and mapping
 */
export function createValidateRowFromRowSchema<T extends Record<string, unknown>>(
  rowSchema: z.ZodType<T, any, any>,
  columns: ColumnDefinition[],
): (row: TableRow) => Record<string, string> {
  return (row: TableRow) => {
    const errors: Record<string, string> = {};

    // First normalize the row cells to canonical string format
    const normalizedCells = normalizeRowCells(row.cells, columns);
    const normalizedRow: TableRow = { ...row, cells: normalizedCells };

    // Map to typed domain entity (this converts strings to proper types)
    const domainEntity = mapTableRowToDomain<T>(normalizedRow, columns);

    try {
      // Validate the normalized, typed entity against the schema
      rowSchema.parse(domainEntity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Map Zod errors to field errors
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (path) {
            errors[path] = err.message;
          } else {
            // Root-level error
            errors._root = err.message;
          }
        });
      } else {
        errors._root = 'Validation failed';
      }
    }

    return errors;
  };
}

/**
 * Combine column schemas and row schema validation
 * Column schemas are checked first, then row schema
 * 
 * Both operate on normalized, typed domain entities
 */
export function createCombinedValidateRow<T extends Record<string, unknown>>(
  columns: ColumnDefinition[],
  rowSchema?: z.ZodType<T, any, any>,
): (row: TableRow) => Record<string, string> {
  const columnValidator = createValidateRowFromColumnSchemas<T>(columns);
  const rowValidator = rowSchema
    ? createValidateRowFromRowSchema<T>(rowSchema, columns)
    : undefined;

  return (row: TableRow) => {
    const errors: Record<string, string> = {};

    // First validate columns individually
    const columnErrors = columnValidator(row);
    Object.assign(errors, columnErrors);

    // Then validate row as a whole (if schema provided)
    if (rowValidator) {
      const rowErrors = rowValidator(row);
      Object.assign(errors, rowErrors);
    }

    return errors;
  };
}

