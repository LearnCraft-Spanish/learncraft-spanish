import type { TableColumn, TableHook } from '@domain/PasteTable/General';
import type { ColumnDefinition } from '@domain/PasteTable/types';
import type { z } from 'zod';
import {
  useTablePaste,
  useTableRows,
  useTableValidation,
} from '@application/units/pasteTable/hooks';
import { GHOST_ROW_ID } from '@domain/PasteTable/CreateTable';
import {
  mapAndParseTableRowsToDomain,
  mapDomainToTableRows,
  mapTableRowsToDomain,
} from '@domain/PasteTable/functions/mappers';
import { createCombinedValidateRow } from '@domain/PasteTable/functions/schemaValidation';
import { useCallback, useMemo } from 'react';

interface UsePasteTableOptions<T extends Record<string, unknown>> {
  columns: TableColumn[];
  /** Full row Zod schema for row-level validation (preferred) */
  rowSchema?: z.ZodType<T, any, any>;
  initialData?: T[]; // Allow providing initial data
}

/**
 * Main hook for paste table functionality
 * Validation is purely derived from row data
 * Requires Zod schemas (column-level or row-level) for validation
 */
export function usePasteTable<T extends Record<string, unknown>>({
  columns,
  rowSchema,
  initialData = [],
}: UsePasteTableOptions<T>): TableHook<T> {
  // Extract domain columns for mapping
  const domainColumns: ColumnDefinition[] = useMemo(
    () =>
      columns.map((col) => {
        const { label, width, placeholder, ...domainCol } = col;
        return domainCol;
      }),
    [columns],
  );

  // Core row management
  const {
    rows,
    updateCell: updateCellBase,
    setRows,
    resetRows,
    convertGhostRow,
  } = useTableRows<T>({ columns, initialData });

  // Generate validateRow function from Zod schemas
  // Requires either column schemas or row schema to be provided
  const validateRow = useMemo(() => {
    // Check if we have column schemas or row schema
    const hasColumnSchemas = domainColumns.some((col) => col.schema);
    const hasRowSchema = !!rowSchema;

    // Require at least one schema to be provided
    if (!hasColumnSchemas && !hasRowSchema) {
      throw new Error(
        'Either rowSchema or column schemas must be provided for validation',
      );
    }

    // Generate validator from schemas (handles normalization and mapping internally)
    return createCombinedValidateRow<T>(domainColumns, rowSchema);
  }, [domainColumns, rowSchema]);

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

  // Import data from external source
  const importData = useCallback(
    (newData: T[]) => {
      // Map domain entities to TableRows
      const newRows = mapDomainToTableRows(newData, domainColumns);

      // Set rows, preserving ghost row
      setRows((currentRows) => {
        const ghostRow = currentRows.find((row) => row.id === GHOST_ROW_ID);
        return [...newRows, ...(ghostRow ? [ghostRow] : [])];
      });
    },
    [domainColumns, setRows],
  );

  // Save operation - returns data for external save
  // If rowSchema is provided, parses through schema to get complete T[]
  // Otherwise returns Partial<T>[] (column schemas alone can't guarantee completeness)
  const saveData = useCallback(async (): Promise<T[] | undefined> => {
    // Get fresh validation state
    const { isValid } = validateAll();

    // Only return data if valid
    if (!isValid) {
      return undefined;
    }

    // Filter out ghost row
    const dataRows = rows.filter((row) => row.id !== GHOST_ROW_ID);

    // If we have a rowSchema, parse through it to get complete T[]
    if (rowSchema) {
      return mapAndParseTableRowsToDomain<T>(
        dataRows,
        domainColumns,
        rowSchema,
        GHOST_ROW_ID,
      );
    }

    // Without rowSchema, we can't guarantee completeness
    // This shouldn't happen since we require at least one schema, but handle it gracefully
    const data = mapTableRowsToDomain<T>(dataRows, domainColumns);
    return data as T[]; // Type assertion needed here - caller should provide rowSchema
  }, [rows, domainColumns, rowSchema, validateAll]);

  // Reset the table to completely empty state
  const resetTable = useCallback(() => {
    // Reset rows to just a brand new ghost row
    resetRows();

    // Clear any active cell info from paste handling
    clearActiveCellInfo();

    // No need to reset validation explicitly - it will be recalculated
    // by our derived validation mechanism as soon as rows change
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
