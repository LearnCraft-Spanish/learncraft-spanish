import type {
  ColumnDefinition,
  TableRow,
  ValidationState,
} from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import type { z } from 'zod';
import { useTableValidation } from '@application/units/pasteTable/hooks';
import {
  mapAndParseTableRowsToDomain,
  mapDomainToTableRows,
} from '@domain/PasteTable/functions/mappers';
import { createCombinedValidateRow } from '@domain/PasteTable/functions/schemaValidation';
import { useCallback, useMemo } from 'react';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import { useCreateTableState } from '@application/units/pasteTable/useCreateTableState';

/**
 * Create table hook interface
 * For tables that allow creating new records via paste/editing
 * @deprecated Use useCreateTableState + explicit validation composition in use case
 */
export interface CreateTableHook<T> {
  // Data
  data: {
    rows: TableRow[];
    columns: ColumnDefinition[];
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
  validationState: ValidationState;

  // Save operation (returns data for external save)
  // Returns T[] after validation ensures all required fields are present
  saveData: () => Promise<T[] | undefined>;
}

interface UseCreateTableOptions<T extends Record<string, unknown>> {
  columns: ColumnDefinition[];
  /** Full row Zod schema for row-level validation (preferred) */
  rowSchema?: z.ZodType<T, any, any>;
  initialData?: T[];
}

/**
 * Hook for create table functionality
 * Allows creating new records via paste/editing
 * Implements CreateTableHook<T> interface
 *
 * @deprecated This hook is kept for backward compatibility.
 * New code should use useCreateTableState and compose validation explicitly in the use case.
 */
export function useCreateTable<T extends Record<string, unknown>>({
  columns,
  rowSchema,
  initialData = [],
}: UseCreateTableOptions<T>): CreateTableHook<T> {
  // Map initial data to TableRows
  const initialRows = useMemo(
    () => mapDomainToTableRows(initialData, columns),
    [initialData, columns],
  );

  // Use state hook (focused on state only)
  const tableState = useCreateTableState({
    initialRows,
    columns,
  });

  // Generate validateRow function from Zod schemas
  const validateRow = useMemo(() => {
    const hasColumnSchemas = columns.some((col) => col.schema);
    const hasRowSchema = !!rowSchema;

    if (!hasColumnSchemas && !hasRowSchema) {
      throw new Error(
        'Either rowSchema or column schemas must be provided for validation',
      );
    }

    // Use convenience function (does normalize + map + validate internally)
    return createCombinedValidateRow<T>(columns, rowSchema);
  }, [columns, rowSchema]);

  // Validation - derived from row data
  const { validationState } = useTableValidation({
    rows: tableState.data.rows,
    validateRow,
  });

  // Import data - maps domain to table and sets rows
  const importData = useCallback(
    (newData: T[]) => {
      const newRows = mapDomainToTableRows(newData, columns);
      tableState.setRows((currentRows) => {
        const ghostRow = currentRows.find((r) => r.id === GHOST_ROW_ID);
        return [...newRows, ...(ghostRow ? [ghostRow] : [])];
      });
    },
    [columns, tableState],
  );

  // Save operation - returns data for external save
  const saveData = useCallback(async (): Promise<T[] | undefined> => {
    // Require rowSchema for complete type
    if (!rowSchema) {
      throw new Error(
        'rowSchema is required for saveData to return complete T[]',
      );
    }

    // Map and parse through schema to get complete T[]
    const dataRows = tableState.getRows().filter(
      (row) => row.id !== GHOST_ROW_ID,
    );
    return mapAndParseTableRowsToDomain<T>(
      dataRows,
      columns,
      rowSchema,
      GHOST_ROW_ID,
    );
  }, [tableState, columns, rowSchema]);

  // Return CreateTableHook interface
  return {
    data: {
      rows: tableState.data.rows,
      columns: tableState.data.columns,
    },
    updateCell: tableState.updateCell,
    handlePaste: tableState.handlePaste,
    importData,
    resetTable: tableState.resetTable,
    setActiveCellInfo: tableState.setActiveCellInfo,
    clearActiveCellInfo: tableState.clearActiveCellInfo,
    validationState,
    saveData,
  };
}

// Re-export for backward compatibility
export { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
