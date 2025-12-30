import type { DiffsMap } from '@application/units/pasteTable/hooks/useDiffs';
import type {
  ColumnDefinition,
  TableRow,
  ValidationState,
} from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import type { z } from 'zod';
import {
  useDiffs,
  useTablePaste,
  useTableValidation,
} from '@application/units/pasteTable/hooks';
import {
  mapDomainToTableRows,
  mapTableRowsToDomain,
  mergeSourceWithDiffs,
} from '@domain/PasteTable/functions';
import { createCombinedValidateRow } from '@domain/PasteTable/functions/schemaValidation';
import { useCallback, useMemo } from 'react';

// ============================================================================
// IMPORTANT: This hook is intended to service the EditableTable component.
// It is not consumed directly by the interface layer, but always composed by a use case.
// The composition pattern is documented fully in the EditableTable README.md file.
// ============================================================================

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
  hasUnsavedChanges: boolean;
  dirtyRowIds: Set<string>;
  diffs: DiffsMap;
  validationState: ValidationState;

  // Save operation
  applyChanges: () => Promise<void>;
}

interface UseEditTableOptions<T extends Record<string, unknown>> {
  columns: ColumnDefinition[];
  /** Source data from server (required for edit mode) */
  sourceData: T[];
  /** Full row Zod schema for row-level validation (preferred) */
  rowSchema?: z.ZodType<T, any, any>;
  /** Column ID that contains numeric domain ID (default: 'id') */
  idColumnId?: string;
  /** Callback when changes are applied (for external persistence) */
  onApplyChanges?: (dirtyData: Partial<T>[]) => Promise<void>;
  /**
   * Optional function to compute derived fields for merged rows
   * Called after source + diffs are merged, allows recomputing derived fields
   * based on current cell values (e.g., audio URLs from hasAudio boolean)
   */
  computeDerivedFields?: (row: TableRow) => Record<string, string>;
}

/**
 * Hook for edit table functionality
 * Uses diffs-only state model - only stores changes from source.
 */
export function useEditTable<T extends Record<string, unknown>>({
  columns,
  sourceData,
  rowSchema,
  idColumnId = 'id',
  onApplyChanges,
  computeDerivedFields,
}: UseEditTableOptions<T>): EditTableHook<T> {
  // Map source data to TableRows (reactive - updates when React Query updates)
  // Uses idColumnId for deterministic row IDs
  const sourceRows = useMemo(
    () => mapDomainToTableRows(sourceData, columns, idColumnId),
    [sourceData, columns, idColumnId],
  );

  // Get editable column IDs
  const editableColumnIds = useMemo(
    () =>
      columns
        .filter((col) => col.editable !== false && !col.derived)
        .map((col) => col.id),
    [columns],
  );

  // Diffs-only state management
  const { diffs, dirtyRowIds, updateDiff, setRowsViaDiffs, clearDiffs } =
    useDiffs({
      sourceRows,
      editableColumnIds,
    });

  // Derive display rows by merging source with diffs
  // If computeDerivedFields is provided, recompute derived fields after merging
  const rows = useMemo(() => {
    const merged = mergeSourceWithDiffs(sourceRows, diffs);

    if (computeDerivedFields) {
      // Recompute derived fields from current merged cell values
      return merged.map((row) => {
        const derived = computeDerivedFields(row);
        return {
          ...row,
          cells: {
            ...row.cells,
            ...derived,
          },
        };
      });
    }

    return merged;
  }, [sourceRows, diffs, computeDerivedFields]);

  // Generate validateRow function from Zod schemas
  const validateRow = useMemo(() => {
    const hasColumnSchemas = columns.some((col) => col.schema);
    const hasRowSchema = !!rowSchema;

    if (!hasColumnSchemas && !hasRowSchema) {
      throw new Error(
        'Either rowSchema or column schemas must be provided for validation',
      );
    }

    return createCombinedValidateRow<T>(columns, rowSchema);
  }, [columns, rowSchema]);

  // Validation - derived from merged rows
  const { validationState } = useTableValidation({
    rows,
    validateRow,
  });

  // Cell update wrapper that updates diffs
  const updateCellForPaste = useCallback(
    (rowId: string, columnId: string, value: string) => {
      updateDiff(rowId, columnId, value);
    },
    [updateDiff],
  );

  // Paste handling - uses setRowsViaDiffs for bulk operations
  const { setActiveCellInfo, clearActiveCellInfo, handlePaste } = useTablePaste(
    {
      columns,
      rows,
      updateCell: updateCellForPaste,
      setRows: setRowsViaDiffs,
      mode: 'edit',
      idColumnId,
    },
  );

  // Cell update - returns null (no ghost row conversion in edit mode)
  const updateCell = useCallback(
    (rowId: string, columnId: string, value: string) => {
      updateDiff(rowId, columnId, value);
      return null;
    },
    [updateDiff],
  );

  // Import data - computes diffs from imported data
  const importData = useCallback(
    (newData: T[]) => {
      const newRows = mapDomainToTableRows(newData, columns, idColumnId);
      setRowsViaDiffs(newRows);
    },
    [columns, idColumnId, setRowsViaDiffs],
  );

  // Discard changes - just clear diffs
  const discardChanges = useCallback(() => {
    clearDiffs();
    clearActiveCellInfo();
  }, [clearDiffs, clearActiveCellInfo]);

  // Apply changes - save dirty rows
  // NOTE: USE CASE SHOULD HANDLE VALIDATION
  // Validation is not handled here. Use case must ensure that onApplyChanges
  // is called with valid data.
  const applyChanges = useCallback(async () => {
    if (!onApplyChanges) {
      throw new Error('onApplyChanges callback is required for applyChanges');
    }

    // Get only dirty rows from merged state
    // Use diffs.keys() directly to ensure fresh state
    const currentDirtyIds = new Set(diffs.keys());
    const dirtyRows = rows.filter((row) => currentDirtyIds.has(row.id));

    // Map to domain entities
    const dirtyData = mapTableRowsToDomain<T>(dirtyRows, columns);

    // Call external save handler
    await onApplyChanges(dirtyData);

    // After successful save, React Query will refetch and update sourceData
    // When sourceData updates, sourceRows updates, and diffs that match
    // the new source will effectively be "clean" (though we could also clear them)
  }, [rows, diffs, columns, onApplyChanges]);

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
    hasUnsavedChanges: dirtyRowIds.size > 0,
    dirtyRowIds,
    diffs,
    validationState,
    applyChanges,
  };
}
