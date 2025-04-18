import type { TableColumn, TableData, TableRow } from '../types';
import { useCallback, useRef, useState } from 'react';
import { createGhostRow } from '../utils';

interface UseTableRowsProps<T> {
  columns: TableColumn[];
  initialData?: T[];
}

export function useTableRows<T>({
  columns,
  initialData = [],
}: UseTableRowsProps<T>) {
  // Use ref for row ID counter to ensure uniqueness
  const rowIdCounter = useRef(0);

  // Generate guaranteed unique row ID
  const generateRowId = useCallback(() => {
    // Increment counter first for uniqueness
    rowIdCounter.current += 1;

    // Combine timestamp, counter and random value
    return `row-${Date.now()}-${rowIdCounter.current}-${Math.floor(Math.random() * 1000)}`;
  }, []);

  // Convert data to rows with unique IDs
  const convertToRows = useCallback(
    (data: T[]) => {
      return data.map((item) => {
        const cells: Record<string, string> = {};
        columns.forEach((column) => {
          const key = column.id as keyof T;
          const value = item[key];
          cells[column.id] = value !== undefined ? String(value) : '';
        });
        return {
          id: generateRowId(),
          cells,
        };
      });
    },
    [columns, generateRowId],
  );

  // Convert initial data to TableRows
  const initialRows = convertToRows(initialData);

  // Initialize with converted rows + ghost row
  const [data, setData] = useState<TableData>(() => ({
    rows: [...initialRows, createGhostRow(columns)],
  }));

  // Regular cell update for non-ghost rows
  const updateCell = useCallback(
    (rowId: string, columnId: string, value: string) => {
      let updatedRow: TableRow | undefined;

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

          // Create updated row
          const newRow = {
            ...row,
            cells: newCells,
          };

          // Store the updated row for validation
          updatedRow = newRow;

          return newRow;
        });

        return {
          rows: updatedRows,
        };
      });

      // Return the updated row for validation
      return updatedRow;
    },
    [],
  );

  // Create a new empty row
  const createEmptyRow = useCallback(() => {
    return {
      id: generateRowId(),
      cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
    };
  }, [columns, generateRowId]);

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

  // Handle ghost row conversion
  const convertGhostRow = useCallback(
    (rowId: string, columnId: string, value: string) => {
      if (rowId !== 'ghost-row' || value.trim() === '') {
        return null;
      }

      // Create a completely new cells object for the new row
      const newCells: Record<string, string> = {};

      // Initialize all cells to empty strings
      columns.forEach((col) => {
        newCells[col.id] = '';
      });

      // Set the specific cell that was edited
      newCells[columnId] = String(value);

      // Create a new regular row from the ghost row with a unique ID
      const newRowId = generateRowId();
      const newRegularRow: TableRow = {
        id: newRowId,
        cells: newCells,
      };

      // Update rows, ensuring ghost row is preserved
      setData((prev) => {
        const nonGhostRows = prev.rows.filter((row) => row.id !== 'ghost-row');
        return {
          rows: [...nonGhostRows, newRegularRow, createGhostRow(columns)],
        };
      });

      // Return the new row ID for focus management
      return newRowId;
    },
    [columns, generateRowId],
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
    // Reset the row ID counter
    rowIdCounter.current = 0;

    // Force a complete reset by creating a fresh ghost row
    const freshGhostRow = createGhostRow(columns);

    // Explicitly set data to only contain the fresh ghost row
    setData({
      rows: [freshGhostRow],
    });
  }, [columns]);

  return {
    rows: data.rows,
    updateCell,
    addRow,
    convertGhostRow,
    setRows,
    resetRows,
    generateRowId,
    createEmptyRow,
  };
}
