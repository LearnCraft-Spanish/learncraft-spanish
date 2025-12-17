import type {
  ColumnDefinition,
  TableColumn,
  TableRow,
  ValidationState,
} from '@domain/PasteTable/types';
import type { ClipboardEvent } from 'react';
import type { z } from 'zod';
import {
  useTablePaste,
  useTableRows,
  useTableValidation,
} from '@application/units/pasteTable/hooks';

/**
 * ID used for the ghost row that appears at the bottom of create tables
 */
export const GHOST_ROW_ID = 'ghost-row';

/**
 * Create table hook interface
 * For tables that allow creating new records via paste/editing
 */
export interface CreateTableHook<T> {
  // Data
  data: {
    rows: TableRow[];
    columns: TableColumn[];
  };

  // Operations
  updateCell: (rowId: string, columnId: string, value: string) => string | null;
  handlePaste: (e: ClipboardEvent<Element>) => void;
  importData: (data: T[]) => void;
  resetTable: () => void;

  // Focus tracking (for paste operations)
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;

  // State
  isSaveEnabled: boolean;
  validationState: ValidationState;

  // Save operation (returns data for external save)
  // Returns T[] after validation ensures all required fields are present
  saveData: () => Promise<T[] | undefined>;
}
import {
  mapAndParseTableRowsToDomain,
  mapDomainToTableRows,
} from '@domain/PasteTable/functions/mappers';
import { createCombinedValidateRow } from '@domain/PasteTable/functions/schemaValidation';
import { useCallback, useMemo } from 'react';

interface UseCreateTableOptions<T extends Record<string, unknown>> {
  columns: TableColumn[];
  /** Full row Zod schema for row-level validation (preferred) */
  rowSchema?: z.ZodType<T, any, any>;
  initialData?: T[];
}

/**
 * Hook for create table functionality
 * Allows creating new records via paste/editing
 * Implements CreateTableHook<T> interface
 */
export function useCreateTable<T extends Record<string, unknown>>({
  columns,
  rowSchema,
  initialData = [],
}: UseCreateTableOptions<T>): CreateTableHook<T> {
  // Extract domain columns for mapping
  const domainColumns: ColumnDefinition[] = useMemo(
    () =>
      columns.map((col) => {
        const { label, width, placeholder, ...domainCol } = col;
        return domainCol;
      }),
    [columns],
  );

  // Core row management (includes ghost row handling)
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

  // Validation - derived from row data
  const { validationState, isSaveEnabled, validateAll } = useTableValidation({
    rows,
    validateRow,
  });

  // Paste handling - create mode (always creates new rows)
  const { setActiveCellInfo, clearActiveCellInfo, handlePaste } = useTablePaste(
    {
      columns,
      rows,
      updateCell: updateCellBase,
      setRows,
      mode: 'create', // Explicitly set create mode
    },
  );

  // Cell update - handles ghost row conversion
  const updateCell = useCallback(
    (rowId: string, columnId: string, value: string): string | null => {
      // Handle ghost row conversion
      if (rowId === GHOST_ROW_ID && value.trim() !== '') {
        // Convert ghost row to real row, returns new row ID
        return convertGhostRow(rowId, columnId, value);
      }

      // Regular cell update
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
  // Parses through schema to get complete T[] (not Partial<T>[])
  const saveData = useCallback(async (): Promise<T[] | undefined> => {
    // Get fresh validation state
    const { isValid } = validateAll();

    // Only return data if valid
    if (!isValid) {
      return undefined;
    }

    // Require rowSchema for complete type (can't guarantee completeness with column schemas alone)
    if (!rowSchema) {
      throw new Error(
        'rowSchema is required for saveData to return complete T[]',
      );
    }

    // Map and parse through schema to get complete T[]
    const dataRows = rows.filter((row) => row.id !== GHOST_ROW_ID);
    return mapAndParseTableRowsToDomain<T>(
      dataRows,
      domainColumns,
      rowSchema,
      GHOST_ROW_ID,
    );
  }, [rows, domainColumns, rowSchema, validateAll]);

  // Reset table to empty state
  const resetTable = useCallback(() => {
    resetRows();
    clearActiveCellInfo();
  }, [resetRows, clearActiveCellInfo]);

  // Return CreateTableHook interface
  return {
    data: {
      rows,
      columns,
    },
    updateCell,
    handlePaste,
    importData,
    resetTable,
    setActiveCellInfo,
    clearActiveCellInfo,
    isSaveEnabled,
    validationState,
    saveData,
  };
}
