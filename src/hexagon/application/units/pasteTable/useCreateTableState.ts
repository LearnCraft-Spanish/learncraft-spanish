import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import { GHOST_ROW_ID } from '@application/units/pasteTable/constants';
import {
  useTablePaste,
  useTableRows,
} from '@application/units/pasteTable/hooks';
import { createGhostRow } from '@application/units/pasteTable/utils';
import { useCallback, useEffect } from 'react';

/**
 * Create table state hook interface
 * Focused on state management only - no mapping, no validation
 */
export interface CreateTableStateHook {
  // Data
  data: {
    rows: TableRow[];
    columns: ColumnDefinition[];
  };

  // Operations
  updateCell: (rowId: string, columnId: string, value: string) => string | null;
  handlePaste: (e: ClipboardEvent<Element>) => void;
  resetTable: () => void;

  // Focus tracking (for paste operations)
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;

  // Expose rows for use case to map
  getRows: () => TableRow[];
  setRows: (
    rows: TableRow[] | ((currentRows: TableRow[]) => TableRow[]),
  ) => void;
}

interface UseCreateTableStateOptions {
  /** Initial rows (already mapped to TableRow[], not domain entities) */
  initialRows?: TableRow[];
  columns: ColumnDefinition[];
}

/**
 * Hook for create table state management
 * Focused on state only - no mapping, no validation
 * Use case handles mapping and validation separately
 */
export function useCreateTableState({
  initialRows = [],
  columns,
}: UseCreateTableStateOptions): CreateTableStateHook {
  // Core row management (includes ghost row handling)
  // Note: useTableRows expects domain entities and does conversion
  // For TableRow[], we start empty and set via setRows to avoid conversion
  const {
    rows,
    updateCell: updateCellBase,
    setRows: setRowsInternal,
    resetRows,
    convertGhostRow,
  } = useTableRows<TableRow>({
    columns,
    initialData: [], // Start empty, set rows below to avoid conversion
    includeGhostRow: true,
  });

  // Set initial rows on mount if provided (preserving ghost row)
  // This runs after useTableRows initializes with ghost row
  useEffect(() => {
    if (initialRows.length > 0) {
      // useTableRows will have initialized with a ghost row
      // Preserve it when setting initial rows
      const ghostRow = createGhostRow(columns);
      setRowsInternal([...initialRows, ghostRow]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount - initialRows should be stable

  // Paste handling - create mode (always creates new rows)
  const { setActiveCellInfo, clearActiveCellInfo, handlePaste } = useTablePaste(
    {
      columns,
      rows,
      updateCell: updateCellBase,
      setRows: setRowsInternal,
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

  // Reset table to empty state
  const resetTable = useCallback(() => {
    resetRows();
    clearActiveCellInfo();
  }, [resetRows, clearActiveCellInfo]);

  // Expose rows for use case to map
  const getRows = useCallback(() => {
    return rows;
  }, [rows]);

  // Expose setRows for use case to set rows after mapping
  const setRows = useCallback(
    (
      newRowsOrUpdater: TableRow[] | ((currentRows: TableRow[]) => TableRow[]),
    ) => {
      setRowsInternal(newRowsOrUpdater);
    },
    [setRowsInternal],
  );

  return {
    data: {
      rows,
      columns,
    },
    updateCell,
    handlePaste,
    resetTable,
    setActiveCellInfo,
    clearActiveCellInfo,
    getRows,
    setRows,
  };
}
