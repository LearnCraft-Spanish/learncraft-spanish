import type {
  ColumnDefinition,
  TableRow,
  ValidationState,
} from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import type { z } from 'zod';
import {
  useCleanStateSync,
  useDirtyStateTracking,
  useTablePaste,
  useTableRows,
  useTableValidation,
} from '@application/units/pasteTable/hooks';
import {
  mapDomainToTableRows,
  mapTableRowsToDomain,
} from '@domain/PasteTable/functions/mappers';
import { createCombinedValidateRow } from '@domain/PasteTable/functions/schemaValidation';
import { useCallback, useMemo } from 'react';

/**
 * Edit table hook interface
 * For tables that allow editing existing records
 */
export interface EditTableHook<T> {
  // Data
  data: {
    rows: TableRow[];
    columns: ColumnDefinition[];
  };

  // Operations
  updateCell: (rowId: string, columnId: string, value: string) => null;
  handlePaste: (e: ClipboardEvent<Element>) => void;
  importData: (data: T[]) => void;
  discardChanges: () => void;

  // Focus tracking
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;

  // State
  hasUnsavedChanges: boolean; // Alias for isDirty
  validationState: ValidationState;

  // Save operation
  applyChanges: () => Promise<void>;
}

interface UseEditTableOptions<T extends Record<string, unknown>> {
  columns: ColumnDefinition[];
  /** Initial data (required for edit mode) */
  sourceData: T[];
  /** Full row Zod schema for row-level validation (preferred) */
  rowSchema?: z.ZodType<T, any, any>;
  /** Column ID that contains numeric domain ID (default: 'id') */
  idColumnId?: string;
  /** Callback when changes are applied (for external persistence) */
  onApplyChanges?: (dirtyData: Partial<T>[]) => Promise<void>;
}

/**
 * Hook for edit table functionality
 * Allows editing existing records via paste/editing
 * Tracks dirty state and supports discard/apply operations
 * Implements EditTableHook<T> interface
 */
export function useEditTable<T extends Record<string, unknown>>({
  columns,
  sourceData,
  rowSchema,
  idColumnId = 'id',
  onApplyChanges,
}: UseEditTableOptions<T>): EditTableHook<T> {
  // Derive clean rows from sourceData (reactive - updates when React Query updates)
  const cleanRows = useMemo(() => {
    return mapDomainToTableRows(sourceData, columns);
  }, [sourceData, columns]);

  // Core row management (no ghost row in edit mode)
  const {
    rows,
    updateCell: updateCellBase,
    setRows,
  } = useTableRows<T>({
    columns,
    initialData: cleanRows.length > 0 ? sourceData : [],
    includeGhostRow: false, // Edit mode doesn't allow creating new rows
  });

  // Get editable column IDs for dirty comparison
  const editableColumnIds = useMemo(
    () =>
      columns
        .filter((col) => col.editable !== false && !col.derived)
        .map((col) => col.id),
    [columns],
  );

  // Track dirty state by comparing rows to cleanRows (pure derivation)
  const { dirtyRowIds } = useDirtyStateTracking({
    rows,
    cleanRows,
    idColumnId,
    editableColumnIds,
  });

  // Sync non-dirty rows to clean state when sourceData updates
  const { syncRowsToCleanState } = useCleanStateSync({
    cleanRows,
    rows,
    dirtyRowIds,
    idColumnId,
    setRows,
  });

  // Generate validateRow function from Zod schemas
  // Requires either column schemas or row schema to be provided
  const validateRow = useMemo(() => {
    // Check if we have column schemas or row schema
    const hasColumnSchemas = columns.some((col) => col.schema);
    const hasRowSchema = !!rowSchema;

    // Require at least one schema to be provided
    if (!hasColumnSchemas && !hasRowSchema) {
      throw new Error(
        'Either rowSchema or column schemas must be provided for validation',
      );
    }

    // Generate validator from schemas (handles normalization and mapping internally)
    return createCombinedValidateRow<T>(columns, rowSchema);
  }, [columns, rowSchema]);

  // Validation - derived from row data
  const { validationState, validateAll } = useTableValidation({
    rows,
    validateRow,
  });

  // Paste handling - edit mode (updates existing rows only)
  const { setActiveCellInfo, clearActiveCellInfo, handlePaste } = useTablePaste(
    {
      columns,
      rows,
      updateCell: updateCellBase,
      setRows,
      mode: 'edit',
      idColumnId,
    },
  );

  // Cell update - dirty state is derived automatically
  const updateCell = useCallback(
    (rowId: string, columnId: string, value: string) => {
      updateCellBase(rowId, columnId, value);
      return null;
    },
    [updateCellBase],
  );

  // Import data (replaces current state)
  const importData = useCallback(
    (newData: T[]) => {
      const newRows = mapDomainToTableRows(newData, columns);
      setRows(newRows);
    },
    [columns, setRows],
  );

  // Discard changes - revert to clean state (from current sourceData)
  const discardChanges = useCallback(() => {
    setRows([...cleanRows]);
    clearActiveCellInfo();
  }, [cleanRows, setRows, clearActiveCellInfo]);

  // Apply changes - save dirty rows
  // After save, React Query will update sourceData, which will reactively update cleanRows
  const applyChanges = useCallback(async () => {
    if (!onApplyChanges) {
      throw new Error('onApplyChanges callback is required for applyChanges');
    }

    // Get fresh validation state
    const { isValid } = validateAll();

    if (!isValid) {
      throw new Error('Cannot apply changes: validation failed');
    }

    // Get only dirty rows
    const dirtyRows = rows.filter((row) => dirtyRowIds.has(row.id));

    // Map to domain entities
    const dirtyData = mapTableRowsToDomain<T>(dirtyRows, columns);

    // Call external save handler
    await onApplyChanges(dirtyData);

    // Sync non-dirty rows to clean state after save
    syncRowsToCleanState();
  }, [
    rows,
    dirtyRowIds,
    columns,
    validateAll,
    onApplyChanges,
    syncRowsToCleanState,
  ]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = dirtyRowIds.size > 0;

  // Return EditTableHook interface
  return {
    data: {
      rows,
      columns,
    },
    updateCell,
    handlePaste,
    importData,
    discardChanges,
    setActiveCellInfo,
    clearActiveCellInfo,
    hasUnsavedChanges,
    validationState,
    applyChanges,
  };
}
