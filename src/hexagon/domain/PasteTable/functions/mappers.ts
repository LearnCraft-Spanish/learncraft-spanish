/**
 * Domain entity mappers
 * Convert between domain entities (typed) and TableRows (string-based)
 */

import type { ColumnDefinition, TableRow } from '@domain/PasteTable/types';
import type { z } from 'zod';
import {
  formatDateForTable,
  parseDateFromTable,
} from '@domain/PasteTable/functions/dateConversions';
import { normalizeCellValue } from '@domain/PasteTable/functions/normalization';
import { generateRowId } from '@domain/PasteTable/functions/rowId';
import {
  formatBooleanForTable,
  parseBoolean,
} from '@domain/PasteTable/functions/typeConversions';

/**
 * Type guard to check if entity has an id property
 */
function hasId<T>(entity: T): entity is T & { id: string } {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    'id' in entity &&
    typeof (entity as { id: unknown }).id === 'string'
  );
}

/**
 * Convert domain entity to TableRow
 * Handles type conversion: Date → string, number → string, boolean → string
 *
 * @template T - The domain entity type
 */
export function mapDomainToTableRow<T extends Record<string, unknown>>(
  entity: T,
  columns: ColumnDefinition[],
): TableRow {
  const cells: Record<string, string> = {};

  columns.forEach((col) => {
    const key = col.id;

    // Type-safe access - check if key exists in entity
    if (!(key in entity)) {
      cells[col.id] = '';
      return;
    }

    const value = entity[key];

    if (value === undefined || value === null) {
      cells[col.id] = '';
      return;
    }

    // Type-specific conversion with proper type narrowing
    switch (col.type) {
      case 'date': {
        // Domain might have Date object or ISO string
        if (value instanceof Date) {
          cells[col.id] = formatDateForTable(value, col.dateFormat);
        } else if (typeof value === 'string') {
          // Already a string, validate/normalize
          cells[col.id] = formatDateForTable(value, col.dateFormat);
        } else {
          cells[col.id] = '';
        }
        break;
      }

      case 'number': {
        // Normalize number to canonical format (remove .0 for integers, trailing zeros)
        if (typeof value === 'number') {
          cells[col.id] = normalizeCellValue(String(value), col);
        } else if (typeof value === 'string') {
          cells[col.id] = normalizeCellValue(value, col);
        } else {
          cells[col.id] = '';
        }
        break;
      }

      case 'boolean': {
        // Domain has boolean, convert to canonical string representation
        if (typeof value === 'boolean') {
          cells[col.id] = formatBooleanForTable(
            value,
            col.booleanFormat || 'true-false',
          );
        } else if (typeof value === 'string') {
          cells[col.id] = normalizeCellValue(value, col);
        } else {
          cells[col.id] = '';
        }
        break;
      }

      case 'select': {
        // Normalize select value to match option
        cells[col.id] = normalizeCellValue(String(value), col);
        break;
      }

      case 'multi-select': {
        // Multi-select: domain has string[] array, convert to comma-separated string
        if (Array.isArray(value)) {
          const separator = col.separator || ',';
          cells[col.id] = value.join(separator);
        } else if (typeof value === 'string') {
          // Already a string, normalize it
          cells[col.id] = normalizeCellValue(value, col);
        } else {
          cells[col.id] = '';
        }
        break;
      }

      case 'text':
      default: {
        // Text and other types: normalize to trimmed string
        cells[col.id] = normalizeCellValue(String(value), col);
        break;
      }
    }
  });

  // Type-safe ID extraction
  const rowId = hasId(entity) ? entity.id : generateRowId();

  return {
    id: rowId,
    cells,
  };
}

/**
 * Convert array of domain entities to TableRows
 *
 * @template T - The domain entity type (must be a record type)
 */
export function mapDomainToTableRows<T extends Record<string, unknown>>(
  entities: T[],
  columns: ColumnDefinition[],
): TableRow[] {
  return entities.map((entity) => mapDomainToTableRow(entity, columns));
}

/**
 * Type-safe value conversion based on column type
 */
function convertCellValueToDomainType(
  cellValue: string,
  column: ColumnDefinition,
): unknown {
  // Normalize to canonical format before parsing
  const normalized = normalizeCellValue(cellValue, column);

  // Type-specific conversion with proper type narrowing
  switch (column.type) {
    case 'date': {
      // Parse string to Date or ISO string (depending on domain needs)
      const dateValue = parseDateFromTable(normalized, column.dateFormat);
      return dateValue;
    }

    case 'number': {
      const numValue = Number(normalized);
      if (!Number.isNaN(numValue)) {
        return numValue;
      }
      return undefined;
    }

    case 'boolean': {
      return parseBoolean(normalized, column.booleanFormat);
    }

    case 'select': {
      // Return the normalized value (should match an option)
      return normalized || undefined;
    }

    case 'multi-select': {
      // Multi-select: parse comma-separated string to string[] array
      const separator = column.separator || ',';
      const values = normalized
        .split(separator)
        .map((v) => v.trim())
        .filter((v) => v !== '');
      return values.length > 0 ? values : undefined;
    }

    case 'text':
    default: {
      return normalized || undefined;
    }
  }
}

/**
 * Convert TableRow to domain entity
 * Handles type conversion: string → Date, string → number, string → boolean
 *
 * @template T - The domain entity type
 */
export function mapTableRowToDomain<T extends Record<string, unknown>>(
  row: TableRow,
  columns: ColumnDefinition[],
): Partial<T> {
  const entity: Partial<T> = {};

  columns.forEach((col) => {
    const key = col.id;
    const rawValue = row.cells[col.id] || '';

    // Convert with type safety
    const convertedValue = convertCellValueToDomainType(rawValue, col);

    if (convertedValue !== undefined) {
      // Type assertion is necessary here because we can't know T's structure at compile time
      // But we ensure type safety through the column definition
      (entity as Record<string, unknown>)[key] = convertedValue;
    }
  });

  return entity;
}

/**
 * Convert array of TableRows to domain entities
 * Filters out ghost rows automatically
 *
 * @template T - The domain entity type (must be a record type)
 */
export function mapTableRowsToDomain<T extends Record<string, unknown>>(
  rows: TableRow[],
  columns: ColumnDefinition[],
  ghostRowId: string = 'ghost-row',
): Partial<T>[] {
  return rows
    .filter((row) => row.id !== ghostRowId) // Exclude ghost row
    .map((row) => mapTableRowToDomain<T>(row, columns));
}

/**
 * Convert array of TableRows to validated domain entities
 * Parses through Zod schema to ensure completeness and return T[]
 *
 * @template T - The domain entity type (must be a record type)
 */
export function mapAndParseTableRowsToDomain<T extends Record<string, unknown>>(
  rows: TableRow[],
  columns: ColumnDefinition[],
  rowSchema: z.ZodType<T, any, any>,
  ghostRowId: string = 'ghost-row',
): T[] {
  const partialData = mapTableRowsToDomain<T>(rows, columns, ghostRowId);

  // Parse each row through the schema to get complete T[]
  return partialData.map((partial) => rowSchema.parse(partial));
}
