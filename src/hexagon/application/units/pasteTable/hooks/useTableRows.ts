import type { TableColumn, TableData, TableRow } from '../../types';
import { useCallback, useState } from 'react';
import { convertDataToRows, createGhostRow } from '../utils';

interface UseTableRowsProps<T> {
  columns: TableColumn[];
  initialData?: T[];
}

export function useTableRows<T>({
  columns,
  initialData = [],
}: UseTableRowsProps<T>) {
  // Convert initial data to TableRows
  const initialRows = convertDataToRows(initialData, columns);

  // Initialize with converted rows + ghost row
  const [data, setData] = useState<TableData>(() => ({
    rows: [...initialRows, createGhostRow(columns)],
  }));

  // Regular cell update for non-ghost rows
  const updateCell = useCallback(
    (rowId: string, columnId: string, value: string) => {
      setData((prev) => {
        const updatedRows = prev.rows.map((row) => {
          if (row.id !== rowId) return row;

          // Create a completely new cells object to avoid reference issues
          const newCells: Record<string, string> = {};

          // Copy each cell value as a primitive string
          Object.keys(row.cells).forEach((key) => {
            newCells[key] = String(row.cells[key] || '');
          });

          // Update the specific cell with the new value
          newCells[columnId] = String(value);

          // Return a completely new row object
          return {
            ...row,
            cells: newCells,
          };
        });

        return {
          rows: updatedRows,
        };
      });
    },
    [],
  );

  // Add a new row at a specific position (defaulting to before ghost row)
  const addRow = useCallback(
    (newRow: TableRow, position?: 'start' | 'end' | number) => {
      setData((prev) => {
        const nonGhostRows = prev.rows.filter((row) => row.id !== 'ghost-row');
        const ghostRow = prev.rows.find((row) => row.id === 'ghost-row');

        if (position === 'start') {
          return {
            rows: [newRow, ...nonGhostRows, ...(ghostRow ? [ghostRow] : [])],
          };
        }

        if (
          typeof position === 'number' &&
          position >= 0 &&
          position <= nonGhostRows.length
        ) {
          const updatedRows = [...nonGhostRows];
          updatedRows.splice(position, 0, newRow);
          return {
            rows: [...updatedRows, ...(ghostRow ? [ghostRow] : [])],
          };
        }

        // Default: add before ghost row (at the end)
        return {
          rows: [...nonGhostRows, newRow, ...(ghostRow ? [ghostRow] : [])],
        };
      });
    },
    [],
  );

  // Set validation errors for a row
  const setRowValidation = useCallback(
    (rowId: string, errors?: Record<string, string>) => {
      setData((prev) => ({
        rows: prev.rows.map((row) => {
          if (row.id !== rowId) return row;
          return { ...row, validationErrors: errors };
        }),
      }));
    },
    [],
  );

  // Replace all rows while preserving ghost row
  // This version supports both direct row assignments and updater functions
  const setRows = useCallback(
    (
      newRowsOrUpdater: TableRow[] | ((currentRows: TableRow[]) => TableRow[]),
    ) => {
      setData((prev) => {
        // If it's an updater function, call it with the current rows
        const updatedRows =
          typeof newRowsOrUpdater === 'function'
            ? newRowsOrUpdater(prev.rows)
            : newRowsOrUpdater;

        // Ensure we have a ghost row at the end
        const hasGhostRow = updatedRows.some((row) => row.id === 'ghost-row');
        const finalRows = hasGhostRow
          ? updatedRows
          : [...updatedRows, createGhostRow(columns)];

        return { rows: finalRows };
      });
    },
    [columns],
  );

  // Reset table to empty state
  const resetRows = useCallback(() => {
    setData({
      rows: [createGhostRow(columns)],
    });
  }, [columns]);

  return {
    rows: data.rows,
    updateCell,
    addRow,
    setRowValidation,
    setRows,
    resetRows,
  };
}
