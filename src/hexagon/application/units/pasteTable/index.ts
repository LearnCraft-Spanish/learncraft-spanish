import type { TableColumn, TableHook } from '../types';
import { useCallback } from 'react';
import { GHOST_ROW_ID } from '../types';
import {
  useGhostRow,
  useTablePaste,
  useTableRows,
  useTableValidation,
} from './hooks';
import { convertDataToRows } from './utils';

interface UsePasteTableOptions<T> {
  columns: TableColumn[];
  validateRow: (row: T) => Record<string, string>;
  initialData?: T[]; // Allow providing initial data
}

export function usePasteTable<T>({
  columns,
  validateRow,
  initialData = [],
}: UsePasteTableOptions<T>): TableHook<T> {
  // Core row management
  const {
    rows,
    updateCell: updateCellBase,
    setRowValidation,
    setRows,
    resetRows,
  } = useTableRows<T>({ columns, initialData });

  // Ghost row handling
  const { convertGhostRow } = useGhostRow({
    columns,
    setRows,
  });

  // Validation
  const { validateRows, isSaveEnabled } = useTableValidation<T>({
    rows,
    validateRow,
    setRowValidation,
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

  // Cell update with ghost row handling
  const updateCell = useCallback(
    (rowId: string, columnId: string, value: string) => {
      if (rowId === GHOST_ROW_ID && value.trim() !== '') {
        return convertGhostRow(rowId, columnId, value);
      } else {
        updateCellBase(rowId, columnId, value);
        return null;
      }
    },
    [convertGhostRow, updateCellBase],
  );

  // Import data from an external source
  const importData = useCallback(
    (newData: T[]) => {
      const newRows = convertDataToRows(newData, columns);
      setRows(newRows);
    },
    [columns, setRows],
  );

  // Handle save operation
  const saveData = useCallback(async () => {
    const { isValid } = validateRows();

    if (isValid) {
      // Filter out the ghost row and convert to the original data type
      return rows
        .filter((row) => row.id !== GHOST_ROW_ID)
        .map((row) => row.cells as T);
    }
    return undefined;
  }, [rows, validateRows]);

  // Reset the table to empty state
  const resetTable = useCallback(() => {
    resetRows();
  }, [resetRows]);

  // Return the unified API
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
    // Internal cell focus tracking (needed by component)
    setActiveCellInfo,
    clearActiveCellInfo,
    isSaveEnabled,
  };
}
