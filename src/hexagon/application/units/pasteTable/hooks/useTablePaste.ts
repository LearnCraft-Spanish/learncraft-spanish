import type { ClipboardEvent } from 'react';
import type { TableColumn, TableRow } from '../types';
import { useCallback, useState } from 'react';
import { GHOST_ROW_ID } from '../types';
import {
  convertJsonToRow,
  convertTsvToRows,
  detectHeaderRow,
  parseTsv,
  tryParseJson,
} from '../utils';

interface UseTablePasteProps {
  columns: TableColumn[];
  rows: TableRow[];
  updateCell: (rowId: string, columnId: string, value: string) => void;
  setRows: (rows: TableRow[]) => void;
}

export function useTablePaste({
  columns,
  rows,
  updateCell,
  setRows,
}: UseTablePasteProps) {
  // Track active cell to coordinate paste operations
  const [activeCell, setActiveCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  // Internal methods for tracking active cell
  const setActiveCellInfo = useCallback((rowId: string, columnId: string) => {
    setActiveCell({ rowId, columnId });
  }, []);

  const clearActiveCellInfo = useCallback(() => {
    setActiveCell(null);
  }, []);

  // Helper function for cell-specific paste operations
  const handleCellPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>, rowId: string, columnId: string) => {
      e.preventDefault(); // Prevent default paste behavior
      const pastedText = e.clipboardData.getData('text');

      // If pasted text contains newlines or tabs, it's likely tabular data
      const hasStructure = /[\t\n\r]/.test(pastedText);

      if (hasStructure) {
        // Process multi-line or tabular data
        const parsedRows = parseTsv(pastedText);

        if (parsedRows.length === 0) return; // Nothing to paste

        // Find the index of the current row
        const currentRowIndex = rows.findIndex((row) => row.id === rowId);
        if (currentRowIndex === -1) return;

        // Find the index of the current column
        const currentColumnIndex = columns.findIndex(
          (col) => col.id === columnId,
        );
        if (currentColumnIndex === -1) return;

        // Copy existing rows
        const newRows = [...rows];

        // Process each row of pasted data
        parsedRows.forEach((rowText, rowOffset) => {
          const cells = rowText;

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
              id: `row-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              cells: { ...newRows[targetRowIndex].cells },
            };
          } else {
            // Create new row
            const cellsObj: Record<string, string> = {};
            columns.forEach((col) => {
              cellsObj[col.id] = '';
            });
            targetRow = {
              id: `row-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

        // Set the updated rows
        setRows(newRows);
      } else {
        // Simple single-cell paste - just update the cell value
        updateCell(rowId, columnId, pastedText);
      }
    },
    [columns, rows, updateCell, setRows],
  );

  // Main paste handler
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
      const { isJson, jsonData } = tryParseJson(text);

      // Handle JSON data
      if (isJson && jsonData) {
        const newRow = convertJsonToRow(jsonData, columns);

        // Filter out ghost row and add new row
        const existingRows = rows.filter((row) => row.id !== GHOST_ROW_ID);
        setRows([...existingRows, newRow]);
        return;
      }

      // Regular tab-separated values handling
      const parsedRows = parseTsv(text);

      if (parsedRows.length === 0) return; // Nothing to paste

      // Check if we have a header row
      const { hasHeaderRow, headerColumnMap } = detectHeaderRow(
        parsedRows[0],
        columns,
      );

      // Convert to table rows
      const newRows = convertTsvToRows(
        parsedRows,
        columns,
        hasHeaderRow,
        headerColumnMap,
      );

      // Filter out ghost row and add new rows
      const existingRows = rows.filter((row) => row.id !== GHOST_ROW_ID);
      setRows([...existingRows, ...newRows]);
    },
    [activeCell, columns, rows, handleCellPaste, setRows],
  );

  return {
    activeCell,
    setActiveCellInfo,
    clearActiveCellInfo,
    handlePaste,
  };
}
