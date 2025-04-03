import type { ClipboardEvent } from 'react';
import type { TableColumn, TableData, TableHook, TableRow } from './types';
import { useCallback, useState } from 'react';
import { GHOST_ROW_ID } from './types';

interface UseTableDataOptions<T> {
  columns: TableColumn[];
  validateRow: (row: T) => Record<string, string>;
}

/**
 * Creates an empty ghost row with the given columns
 */
const createGhostRow = (columns: TableColumn[]): TableRow => ({
  id: GHOST_ROW_ID,
  cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
});

export function useTableData<T>({
  columns,
  validateRow,
}: UseTableDataOptions<T>): TableHook<T> {
  const [data, setData] = useState<TableData>({
    rows: [createGhostRow(columns)],
  });

  const [isValid, setIsValid] = useState(true);

  const handlePaste = useCallback(
    (e: ClipboardEvent<Element>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      const rows = text.split('\n').map((row) => row.split('\t'));

      // Filter out empty rows
      const nonEmptyRows = rows.filter((row) =>
        row.some((cell) => cell.trim() !== ''),
      );

      const newRows: TableRow[] = nonEmptyRows.map((cells, index) => {
        // Create a unique ID for each row based on timestamp and index
        const rowId = `row-${Date.now()}-${index}`;

        // Create cells object from pasted data
        const cellsObj = cells.reduce(
          (acc, cell, colIndex) => {
            if (columns[colIndex]) {
              acc[columns[colIndex].id] = cell;
            }
            return acc;
          },
          {} as Record<string, string>,
        );

        // Ensure all columns have a value (empty string if not provided)
        columns.forEach((col) => {
          if (cellsObj[col.id] === undefined) {
            cellsObj[col.id] = '';
          }
        });

        return {
          id: rowId,
          cells: cellsObj,
        };
      });

      // Always ensure exactly one ghost row at the end
      setData({
        rows: [...newRows, createGhostRow(columns)],
      });
    },
    [columns],
  );

  const handleCellChange = useCallback(
    (rowId: string, columnId: string, value: string) => {
      setData((prev) => {
        // Check if we're editing the ghost row and adding content
        if (rowId === GHOST_ROW_ID && value.trim() !== '') {
          // Find the ghost row
          const ghostRow = prev.rows.find((r) => r.id === GHOST_ROW_ID);

          if (!ghostRow) {
            console.error('Ghost row not found in table data');
            return prev;
          }

          // Create a new regular row from the ghost row
          const newRegularRow: TableRow = {
            ...ghostRow,
            id: `row-${Date.now()}`, // Create a unique ID
            cells: {
              ...ghostRow.cells,
              [columnId]: value,
            },
          };

          // Return new state with the converted row and a fresh ghost row
          return {
            rows: [
              ...prev.rows.filter((r) => r.id !== GHOST_ROW_ID),
              newRegularRow,
              createGhostRow(columns),
            ],
          };
        }

        // Regular cell update for non-ghost rows
        return {
          rows: prev.rows.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  cells: {
                    ...row.cells,
                    [columnId]: value,
                  },
                }
              : row,
          ),
        };
      });
    },
    [columns],
  );

  const handleSave = useCallback(async () => {
    // Filter out the ghost row for validation and submission
    const rows = data.rows.filter((row) => row.id !== GHOST_ROW_ID);
    const errors: Record<string, Record<string, string>> = {};

    rows.forEach((row) => {
      const rowData = row.cells as T;
      const rowErrors = validateRow(rowData);
      if (Object.keys(rowErrors).length > 0) {
        errors[row.id] = rowErrors;
      }
    });

    // Update validation state
    setIsValid(Object.keys(errors).length === 0);

    // Update rows with validation errors
    setData((prev) => ({
      rows: prev.rows.map((row) =>
        errors[row.id]
          ? { ...row, validationErrors: errors[row.id] }
          : { ...row, validationErrors: undefined },
      ),
    }));

    if (Object.keys(errors).length === 0) {
      return rows.map((row) => row.cells as T);
    }
    return undefined;
  }, [data.rows, validateRow]);

  const clearTable = useCallback(() => {
    setData({
      rows: [createGhostRow(columns)],
    });
    setIsValid(true);
  }, [columns]);

  const isSaveEnabled = isValid && data.rows.length > 1; // More than just the ghost row

  return {
    data,
    columns,
    handlePaste,
    handleCellChange,
    handleSave,
    clearTable,
    isSaveEnabled,
  };
}
