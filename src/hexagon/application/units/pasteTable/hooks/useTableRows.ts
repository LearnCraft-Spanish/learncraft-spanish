import type {
  TableColumn,
  TableData,
  TableRow,
} from '@domain/PasteTable/General';
import { createGhostRow } from '@application/units/pasteTable/utils';
import { useCallback, useRef, useState } from 'react';

interface UseTableRowsProps<T> {
  columns: TableColumn[];
  initialData?: T[];
  /** Whether to include ghost row for adding new entries (default: true) */
  includeGhostRow?: boolean;
}

export function useTableRows<T>({
  columns,
  initialData = [],
  includeGhostRow = true,
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

  // Initialize with converted rows (+ ghost row if enabled)
  const [data, setData] = useState<TableData>(() => ({
    rows: includeGhostRow
      ? [...initialRows, createGhostRow(columns)]
      : initialRows,
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

          // Update the specific cell with the new value (as string)
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

  // Replace all rows while preserving ghost row (if enabled)
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

        // Only add ghost row if enabled
        if (!includeGhostRow) {
          return { rows: updatedRows };
        }

        // Ensure we have a ghost row at the end
        const hasGhostRow = updatedRows.some((row) => row.id === 'ghost-row');
        const finalRows = hasGhostRow
          ? updatedRows
          : [...updatedRows, createGhostRow(columns)];

        return { rows: finalRows };
      });
    },
    [columns, includeGhostRow],
  );

  // Reset table to empty state
  const resetRows = useCallback(() => {
    // Reset the row ID counter
    rowIdCounter.current = 0;

    // Reset to empty (with ghost row if enabled)
    if (includeGhostRow) {
      const freshGhostRow = createGhostRow(columns);
      setData({ rows: [freshGhostRow] });
    } else {
      setData({ rows: [] });
    }
  }, [columns, includeGhostRow]);

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
