import type { TableColumn, TableHook } from '@domain/PasteTable/General';
import {
  useTablePaste,
  useTableRows,
  useTableValidation,
} from '@application/units/pasteTable/hooks';
import { GHOST_ROW_ID } from '@domain/PasteTable/CreateTable';
import { createCombinedValidateRow } from '@domain/PasteTable/functions/schemaValidation';
import { mapTableRowToDomain } from '@domain/PasteTable/functions/mappers';
import { normalizeRowCells } from '@domain/PasteTable/functions/normalization';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable/types';
import type { z } from 'zod';
import { useCallback, useMemo } from 'react';

interface UsePasteTableOptions<T extends Record<string, unknown>> {
  columns: TableColumn[];
  /** Row validation function (optional if rowSchema or column schemas provided)
   * @deprecated Prefer using rowSchema or column schemas for type-safe validation
   */
  validateRow?: (row: T) => Record<string, string>;
  /** Full row Zod schema for row-level validation (preferred) */
  rowSchema?: z.ZodType<T, any, any>;
  initialData?: T[]; // Allow providing initial data
}

/**
 * Main hook for paste table functionality
 * Validation is purely derived from row data
 * Supports Zod schemas (column-level or row-level) or custom validateRow function
 */
export function usePasteTable<T>({
  columns,
  validateRow: validateRowFn,
  rowSchema,
  initialData = [],
}: UsePasteTableOptions<T>): TableHook<T> {
  // Core row management
  const {
    rows,
    updateCell: updateCellBase,
    setRows,
    resetRows,
    convertGhostRow,
  } = useTableRows<T>({ columns, initialData });

  // Generate validateRow function from schemas if provided
  // All validation operates on normalized, typed domain entities
  const validateRow = useMemo(() => {
    // Extract domain columns (without UI properties)
    const domainColumns: ColumnDefinition[] = columns.map((col) => {
      const { label, width, placeholder, ...domainCol } = col;
      return domainCol;
    });

    // Check if we have column schemas or row schema
    const hasColumnSchemas = domainColumns.some((col) => col.schema);
    const hasRowSchema = !!rowSchema;

    // If we have schemas, generate validator from them (normalizes + maps internally)
    if (hasColumnSchemas || hasRowSchema) {
      return createCombinedValidateRow<T>(domainColumns, rowSchema);
    }

    // Otherwise, use provided function (but we still need to normalize + map)
    if (!validateRowFn) {
      throw new Error(
        'Either validateRow function, rowSchema, or column schemas must be provided',
      );
    }

    // Adapter: normalize + map TableRow to T, then call validateRowFn
    return (row: TableRow): Record<string, string> => {
      // Normalize cells to canonical format
      const normalizedCells = normalizeRowCells(row.cells, domainColumns);
      const normalizedRow: TableRow = { ...row, cells: normalizedCells };

      // Map to typed domain entity
      const domainEntity = mapTableRowToDomain<T>(normalizedRow, domainColumns);

      // Validate the normalized, typed entity
      return validateRowFn(domainEntity);
    };
  }, [columns, rowSchema, validateRowFn]);

  // Validation - now purely derived from row data
  // validateRow function operates on TableRow (normalized, typed)
  const { validationState, isSaveEnabled, validateAll } = useTableValidation({
    rows,
    validateRow,
  });

  // Paste handling
  const { setActiveCellInfo, clearActiveCellInfo, handlePaste } = useTablePaste(
    {
      columns,
      rows,
      updateCell: updateCellBase,
      setRows,
    },
  );

  // Cell update - now triggering validation directly
  const updateCell = useCallback(
    (rowId: string, columnId: string, value: string) => {
      // Handle ghost row conversion
      if (rowId === GHOST_ROW_ID && value.trim() !== '') {
        // Convert ghost row to real row
        return convertGhostRow(rowId, columnId, value);
      }

      // Update cell data and trigger validation
      updateCellBase(rowId, columnId, value);
      return null;
    },
    [convertGhostRow, updateCellBase],
  );

  // Import data from an external source
  const importData = useCallback(
    (newData: T[]) => {
      // Convert data to rows with our internal row ID generation
      const rows = newData.map((item) => {
        const cells = {} as Record<string, string>;
        columns.forEach((col) => {
          const key = col.id as keyof T;
          const value = item[key];
          cells[col.id] = value !== undefined ? String(value) : '';
        });
        return cells;
      });

      // Set the rows
      setRows((currentRows) => {
        // Find ghost row to preserve it
        const ghostRow = currentRows.find((row) => row.id === GHOST_ROW_ID);

        // Convert rows to TableRows using updateCellBase
        const newRows = rows.map((cells) => ({
          id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          cells,
        }));

        // Return with ghost row at the end
        return [...newRows, ...(ghostRow ? [ghostRow] : [])];
      });
    },
    [columns, setRows],
  );

  // Handle save operation
  const saveData = useCallback(async () => {
    // Get fresh validation state
    const { isValid } = validateAll();

    // If validation state says we're valid, we can proceed
    if (isValid) {
      return rows
        .filter((row) => row.id !== GHOST_ROW_ID)
        .map((row) => {
          // Just like in validation, convert frequency to number
          return {
            ...row.cells,
            // Convert frequency to number if it exists
            frequency:
              row.cells.frequency !== undefined
                ? Number(row.cells.frequency)
                : undefined,
          } as T;
        });
    }

    return undefined;
  }, [rows, validateAll]);

  // Reset the table to completely empty state
  const resetTable = useCallback(() => {
    // Reset rows to just a brand new ghost row
    resetRows();

    // Clear any active cell info from paste handling
    clearActiveCellInfo();

    // No need to reset validation explicitly - it will be recalculated
    // by our derived validation mechanism as soon as rows change

    console.error('Table completely reset'); // Debugging
  }, [resetRows, clearActiveCellInfo]);

  // Return a clean, focused API
  return {
    data: {
      rows,
      columns,
    },
    updateCell,
    saveData,
    resetTable,
    importData,
    handlePaste,
    setActiveCellInfo,
    clearActiveCellInfo,
    isSaveEnabled,
    validationState,
  };
}
