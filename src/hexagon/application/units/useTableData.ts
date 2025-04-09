import type { ClipboardEvent } from 'react';
import type { TableColumn, TableData, TableHook, TableRow } from './types';
import { useCallback, useState } from 'react';
import { GHOST_ROW_ID } from './types';

interface UseTableDataOptions<T> {
  columns: TableColumn[];
  validateRow: (row: T) => Record<string, string>;
  initialData?: T[]; // Allow providing initial data
}

/**
 * Creates an empty ghost row with the given columns
 */
const createGhostRow = (columns: TableColumn[]): TableRow => ({
  id: GHOST_ROW_ID,
  cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
});

/**
 * Generates a unique row ID based on current timestamp
 */
const generateRowId = (): string =>
  `row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export function useTableData<T>({
  columns,
  validateRow,
  initialData = [],
}: UseTableDataOptions<T>): TableHook<T> {
  // Convert initial data to TableRows if provided
  const initialRows: TableRow[] = initialData.map((_item, _index) => {
    const cells: Record<string, string> = {};
    // Map each item property to a cell using column IDs
    columns.forEach((column) => {
      const key = column.id as keyof T;
      const value = _item[key];
      cells[column.id] = value !== undefined ? String(value) : '';
    });
    return {
      id: generateRowId(),
      cells,
    };
  });

  // Initialize with converted rows + ghost row
  const [data, setData] = useState<TableData>(() => ({
    rows: [...initialRows, createGhostRow(columns)],
  }));

  const [isValid, setIsValid] = useState(true);

  // Track active cell to coordinate paste operations
  const [activeCell, setActiveCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  // Function to track which cell is currently active
  const setActiveCellInfo = useCallback((rowId: string, columnId: string) => {
    setActiveCell({ rowId, columnId });
  }, []);

  // Function to clear active cell tracking
  const clearActiveCellInfo = useCallback(() => {
    setActiveCell(null);
  }, []);

  // Function to set data from external source
  const setExternalData = useCallback(
    (newData: T[]) => {
      const newRows: TableRow[] = newData.map((_item, _index) => {
        const cells: Record<string, string> = {};
        columns.forEach((column) => {
          const key = column.id as keyof T;
          const value = _item[key];
          cells[column.id] = value !== undefined ? String(value) : '';
        });
        return {
          id: generateRowId(),
          cells,
        };
      });

      setData({
        rows: [...newRows, createGhostRow(columns)],
      });
    },
    [columns],
  );

  // Handle cell value changes
  const handleCellChange = useCallback(
    (rowId: string, columnId: string, value: string) => {
      let newRowId: string | null = null; // Track the new row ID when converting ghost row

      setData((prev) => {
        // Check if we're editing the ghost row and adding content
        if (rowId === GHOST_ROW_ID && value.trim() !== '') {
          // Find the ghost row
          const ghostRow = prev.rows.find((r) => r.id === GHOST_ROW_ID);

          if (!ghostRow) {
            console.error('Ghost row not found in table data');
            return prev;
          }

          // Create a completely new cells object for the new row
          const newCells: Record<string, string> = {};

          // Copy all values as primitives to avoid reference sharing
          Object.keys(ghostRow.cells).forEach((key) => {
            newCells[key] = String(ghostRow.cells[key] || '');
          });

          // Update the specific cell
          newCells[columnId] = String(value);

          // Create a new regular row ID and store it for focus tracking
          newRowId = generateRowId();

          // Create a new regular row from the ghost row
          const newRegularRow: TableRow = {
            id: newRowId, // Use the new ID
            cells: newCells, // Use the new cells object
          };

          // Return new state with the converted row and a fresh ghost row
          const newRows = [
            ...prev.rows.filter((r) => r.id !== GHOST_ROW_ID),
            newRegularRow,
            createGhostRow(columns),
          ];

          return {
            rows: newRows,
          };
        }

        // Regular cell update for non-ghost rows
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

      // Return the new row ID if we converted a ghost row
      return newRowId;
    },
    [columns],
  );

  // Handle cell-specific paste operations
  const handleCellPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>, rowId: string, columnId: string) => {
      e.preventDefault(); // Prevent default paste behavior
      const pastedText = e.clipboardData.getData('text');

      // If pasted text contains newlines or tabs, it's likely tabular data
      const hasStructure = /[\t\n\r]/.test(pastedText);

      if (hasStructure) {
        // Process multi-line or tabular data
        const rows = pastedText
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .split('\n')
          .filter((row) => row.trim() !== '');

        if (rows.length === 0) return; // Nothing to paste

        setData((prev) => {
          // Find the index of the current row
          const currentRowIndex = prev.rows.findIndex(
            (row) => row.id === rowId,
          );
          if (currentRowIndex === -1) return prev;

          // Find the index of the current column
          const currentColumnIndex = columns.findIndex(
            (col) => col.id === columnId,
          );
          if (currentColumnIndex === -1) return prev;

          // Copy existing rows
          const newRows = [...prev.rows];

          // Process each row of pasted data
          rows.forEach((rowText, rowOffset) => {
            const cells = rowText.split('\t');

            // Get or create target row
            const targetRowIndex = currentRowIndex + rowOffset;
            let targetRow: TableRow;

            if (
              targetRowIndex < newRows.length &&
              newRows[targetRowIndex].id !== GHOST_ROW_ID
            ) {
              // Use existing row
              targetRow = { ...newRows[targetRowIndex] };
              targetRow.cells = { ...targetRow.cells };
            } else if (
              targetRowIndex === newRows.length - 1 &&
              newRows[targetRowIndex].id === GHOST_ROW_ID
            ) {
              // Convert ghost row to regular row
              targetRow = {
                id: generateRowId(),
                cells: { ...newRows[targetRowIndex].cells },
              };
            } else {
              // Create new row
              const cellsObj: Record<string, string> = {};
              columns.forEach((col) => {
                cellsObj[col.id] = '';
              });
              targetRow = {
                id: generateRowId(),
                cells: cellsObj,
              };
            }

            // Update cells with pasted data
            cells.forEach((cellText, cellOffset) => {
              const targetColumnIndex = currentColumnIndex + cellOffset;
              if (targetColumnIndex < columns.length) {
                const targetColumnId = columns[targetColumnIndex].id;
                targetRow.cells[targetColumnId] = cellText.trim();
              }
            });

            // Update the row in our array
            if (targetRowIndex < newRows.length) {
              newRows[targetRowIndex] = targetRow;
            } else {
              newRows.push(targetRow);
            }
          });

          // Ensure we have a ghost row at the end
          if (newRows[newRows.length - 1].id !== GHOST_ROW_ID) {
            newRows.push(createGhostRow(columns));
          }

          return { rows: newRows };
        });
      } else {
        // Simple single-cell paste - just update the cell value
        handleCellChange(rowId, columnId, pastedText);
      }
    },
    [columns, handleCellChange],
  );

  // Main paste handler (table-level) - delegates to cell paste when appropriate
  const handlePaste = useCallback(
    (e: ClipboardEvent<Element>) => {
      // If we have an active cell, redirect the paste there
      if (activeCell) {
        handleCellPaste(
          e as ClipboardEvent<HTMLInputElement>,
          activeCell.rowId,
          activeCell.columnId,
        );
        return;
      }

      // Otherwise, perform table-level paste
      e.preventDefault();
      const text = e.clipboardData.getData('text');

      // Check if the pasted content might be JSON
      let isJson = false;
      let jsonData: any = null;

      if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
        try {
          jsonData = JSON.parse(text.trim());
          isJson = true;
        } catch {
          // Continue with normal tab-separated parsing
        }
      }

      // Handle JSON data differently if detected
      if (isJson && jsonData) {
        // Extract data properly from the structure
        setData((prev) => {
          const existingRows = prev.rows.filter(
            (row) => row.id !== GHOST_ROW_ID,
          );

          // Create a new row with proper column mapping
          const cellsObj: Record<string, string> = {};

          // Initialize all columns with empty values first
          columns.forEach((col) => {
            cellsObj[col.id] = '';
          });

          // If the pasted JSON contains cell data (in any format), try to map it
          if (jsonData.cells) {
            // Special case: cells object has 'undefined' as a key (bug)
            // This happens when an object with improper column IDs is pasted
            if ('undefined' in jsonData.cells) {
              // Map to the first available column as a reasonable fallback
              if (columns.length > 0) {
                // Find the first column that seems most appropriate (the descriptor/main field)
                const targetColumnId = columns[0].id;
                cellsObj[targetColumnId] = String(
                  jsonData.cells.undefined || '',
                );
              }
            } else {
              // Normal case: map keys to columns if they match
              Object.entries(jsonData.cells).forEach(([key, value]) => {
                const matchingColumn = columns.find((col) => col.id === key);
                if (matchingColumn) {
                  cellsObj[matchingColumn.id] = String(value || '');
                }
              });
            }
          }

          const newRow: TableRow = {
            id: jsonData.id || jsonData.rowId || generateRowId(),
            cells: cellsObj,
          };

          const updatedRows = [
            ...existingRows,
            newRow,
            createGhostRow(columns),
          ];

          return {
            rows: updatedRows,
          };
        });

        return;
      }

      // Regular tab-separated values handling
      const rows = text
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n') // Handle old Mac line endings
        .split('\n')
        .map((row) => row.split('\t'));

      // Filter out empty rows
      const nonEmptyRows = rows.filter((row) =>
        row.some((cell) => cell.trim() !== ''),
      );

      // Check if we have a header row that matches our column labels
      let hasHeaderRow = false;
      const headerColumnMap: Record<number, string> = {};

      if (nonEmptyRows.length > 0) {
        const potentialHeaderRow = nonEmptyRows[0];
        // Check if header row matches column labels
        const matchCount = potentialHeaderRow.filter((cellValue, index) => {
          // Find a column with matching label
          const matchingColumn = columns.find(
            (col) => col.label.toLowerCase() === cellValue.trim().toLowerCase(),
          );

          if (matchingColumn) {
            // Store the mapping between column index and column ID
            headerColumnMap[index] = matchingColumn.id;
            return true;
          }
          return false;
        }).length;

        // If more than half the columns match, consider it a header row
        hasHeaderRow =
          matchCount >=
          Math.min(potentialHeaderRow.length / 2, columns.length / 2);
      }

      // Skip the header row if detected
      const dataRows = hasHeaderRow ? nonEmptyRows.slice(1) : nonEmptyRows;

      // Create new rows with entirely separate cell objects
      const newRows: TableRow[] = dataRows.map((cells, _index) => {
        // Create a unique ID for each row
        const rowId = generateRowId();

        // Create a fresh cells object with each cell as a primitive value
        const cellsObj: Record<string, string> = {};

        // Initialize all columns with empty values
        columns.forEach((col) => {
          cellsObj[col.id] = '';
        });

        // If we have a header row, use the column mapping
        if (hasHeaderRow) {
          cells.forEach((cell, colIndex) => {
            const columnId = headerColumnMap[colIndex];
            if (columnId) {
              cellsObj[columnId] = String(cell.trim());
            }
          });
        } else {
          // No header row - map by position
          cells.forEach((cell, colIndex) => {
            if (columns[colIndex]) {
              cellsObj[columns[colIndex].id] = String(cell.trim());
            }
          });
        }

        return {
          id: rowId,
          cells: cellsObj,
        };
      });

      // Add new rows to existing data, keeping non-ghost rows and adding a new ghost row
      setData((prev) => {
        const existingRows = prev.rows.filter((row) => row.id !== GHOST_ROW_ID);

        const updatedRows = [
          ...existingRows,
          ...newRows,
          createGhostRow(columns),
        ];

        return {
          rows: updatedRows,
        };
      });
    },
    [activeCell, columns, handleCellPaste],
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
      rows: prev.rows.map((row) => {
        if (errors[row.id]) {
          // Create a new row object with validation errors
          return {
            ...row,
            validationErrors: errors[row.id],
          };
        }
        // Create a new row object without validation errors
        return {
          ...row,
          validationErrors: undefined,
        };
      }),
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
    handleCellPaste,
    handleCellChange,
    handleSave,
    clearTable,
    setActiveCellInfo,
    clearActiveCellInfo,
    setExternalData,
    isSaveEnabled,
  };
}
