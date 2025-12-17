import type { EditTableHook } from '@domain/PasteTable/EditTable';
import type { ColumnDefinition, TableColumn } from '@domain/PasteTable/types';
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
import { cellsEqual } from '@domain/PasteTable/functions/rowComparison';
import { createCombinedValidateRow } from '@domain/PasteTable/functions/schemaValidation';
import { useCallback, useMemo } from 'react';

interface UseEditTableOptions<T extends Record<string, unknown>> {
  columns: TableColumn[];
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
  // Extract domain columns for mapping
  const domainColumns: ColumnDefinition[] = useMemo(
    () =>
      columns.map((col) => {
        const { label, width, placeholder, ...domainCol } = col;
        return domainCol;
      }),
    [columns],
  );

  // Derive clean rows from sourceData (reactive - updates when React Query updates)
  const cleanRows = useMemo(() => {
    return mapDomainToTableRows(sourceData, domainColumns);
  }, [sourceData, domainColumns]);

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

  // Track dirty state by comparing rows to cleanRows
  const { dirtyRowIds, markRowDirty, clearDirtyRows, clearAllDirty } =
    useDirtyStateTracking({
      rows,
      cleanRows,
      idColumnId,
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
  const { validationState, validateAll } = useTableValidation({
    rows,
    validateRow,
  });

  // Track dirty state when rows are updated (from paste operations)
  const handleRowUpdated = useCallback(
    (rowId: string, _domainId: number) => {
      markRowDirty(rowId);
    },
    [markRowDirty],
  );

  // Paste handling - edit mode (updates existing rows only)
  const { setActiveCellInfo, clearActiveCellInfo, handlePaste } = useTablePaste(
    {
      columns,
      rows,
      updateCell: updateCellBase,
      setRows,
      mode: 'edit', // Explicitly set edit mode
      idColumnId,
      onRowUpdated: handleRowUpdated,
    },
  );

  // Cell update - tracks dirty state against current cleanRows
  const updateCell = useCallback(
    (rowId: string, columnId: string, value: string) => {
      updateCellBase(rowId, columnId, value);

      // Check if row changed from clean state (reactive to initialData)
      const currentRow = rows.find((r) => r.id === rowId);
      const cleanRow = cleanRows.find(
        (r) =>
          r.id === rowId ||
          Number(r.cells[idColumnId]) === Number(currentRow?.cells[idColumnId]),
      );

      if (currentRow && cleanRow) {
        // Update cell in current row for comparison
        const updatedRow = {
          ...currentRow,
          cells: { ...currentRow.cells, [columnId]: value },
        };

        const hasChanged = !cellsEqual(cleanRow.cells, updatedRow.cells);
        if (hasChanged) {
          markRowDirty(rowId);
        } else {
          // If row matches clean state, remove from dirty set
          clearDirtyRows([rowId]);
        }
      }
    },
    [updateCellBase, rows, cleanRows, idColumnId, markRowDirty, clearDirtyRows],
  );

  // Import data (replaces current state and resets dirty tracking)
  const importData = useCallback(
    (newData: T[]) => {
      const newRows = mapDomainToTableRows(newData, domainColumns);
      setRows(newRows);
      clearAllDirty();
    },
    [domainColumns, setRows, clearAllDirty],
  );

  // Discard changes - revert to clean state (from current sourceData)
  const discardChanges = useCallback(() => {
    // Revert to current cleanRows (reactive to sourceData)
    setRows([...cleanRows]);
    clearAllDirty();
    clearActiveCellInfo();
  }, [cleanRows, setRows, clearAllDirty, clearActiveCellInfo]);

  // Apply changes - save dirty rows
  // After save, React Query will update sourceData, which will reactively update cleanRows
  // Sync rows to clean state after save completes
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

    // Map to domain entities (returns Partial<T>[] since TableRow may not have all fields)
    const dirtyData = mapTableRowsToDomain<T>(dirtyRows, domainColumns);

    // Call external save handler with partial data
    // The mutation handler should handle partial data appropriately
    await onApplyChanges(dirtyData);

    // After save, sync rows to clean state (React Query will update sourceData)
    // This syncs non-dirty rows and clears dirty state for saved rows
    syncRowsToCleanState();
    clearDirtyRows(dirtyRows.map((row) => row.id));
  }, [
    rows,
    dirtyRowIds,
    domainColumns,
    validateAll,
    onApplyChanges,
    syncRowsToCleanState,
    clearDirtyRows,
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
