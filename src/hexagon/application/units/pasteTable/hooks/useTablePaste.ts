import type { TableColumn, TableRow } from '@domain/PasteTable/General';
import type { ClipboardEvent } from 'react';
import {
  convertTsvToRows,
  detectHeaderRow,
  parseDelimitedText,
} from '@application/units/pasteTable/utils';
import { cellsEqual } from '@domain/PasteTable/functions/rowComparison';
import { GHOST_ROW_ID } from '@domain/PasteTable/CreateTable';
import { useCallback, useState } from 'react';

interface UseTablePasteProps {
  columns: TableColumn[];
  rows: TableRow[];
  updateCell: (rowId: string, columnId: string, value: string) => void;
  setRows: (rows: TableRow[]) => void;
  /** Mode: 'create' expands table with new rows, 'edit' updates existing rows */
  mode?: 'create' | 'edit';
  /** Column ID that contains numeric domain ID for matching (edit mode only, default: 'id') */
  idColumnId?: string;
  /** Callback when a row is updated in edit mode (for dirty tracking) */
  onRowUpdated?: (rowId: string, domainId: number) => void;
}

export function useTablePaste({
  columns,
  rows,
  updateCell,
  setRows,
  mode = 'create', // Default to create mode for backward compatibility
  idColumnId = 'id', // Default to 'id' column for edit mode matching
  onRowUpdated,
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

      // If pasted text contains newlines, tabs, or commas, it's likely tabular data
      const hasStructure = /[\t\n\r,]/.test(pastedText);

      if (hasStructure) {
        // Process multi-line or tabular data (CSV or TSV)
        const parsedRows = parseDelimitedText(pastedText);

        if (parsedRows.length === 0) return; // Nothing to paste

        // Find the index of the current row
        const currentRowIndex = rows.findIndex((row) => row.id === rowId);
        if (currentRowIndex === -1) return;

        // Find the index of the current column
        const currentColumnIndex = columns.findIndex(
          (col) => col.id === columnId,
        );
        if (currentColumnIndex === -1) return;

        if (mode === 'edit') {
          // Edit mode: Only update existing rows, never create new ones
          const updatedRows = [...rows];

          parsedRows.forEach((rowText, rowOffset) => {
            const targetRowIndex = currentRowIndex + rowOffset;

            // Only update if row exists (don't create new rows)
            if (
              targetRowIndex < updatedRows.length &&
              updatedRows[targetRowIndex].id !== GHOST_ROW_ID
            ) {
              const targetRow = { ...updatedRows[targetRowIndex] };
              targetRow.cells = { ...targetRow.cells };

              // Update cells with pasted data
              rowText.forEach((cellText, cellOffset) => {
                const targetColumnIndex = currentColumnIndex + cellOffset;
                if (
                  targetColumnIndex < columns.length &&
                  targetColumnIndex >= 0
                ) {
                  const targetColumnId = columns[targetColumnIndex].id;
                  targetRow.cells[targetColumnId] = cellText.trim();
                }
              });

              // Check if row changed
              const hasChanged = !cellsEqual(
                updatedRows[targetRowIndex].cells,
                targetRow.cells,
              );

              if (hasChanged) {
                const domainId = Number(targetRow.cells[idColumnId]);
                if (!Number.isNaN(domainId)) {
                  onRowUpdated?.(targetRow.id, domainId);
                }
              }

              updatedRows[targetRowIndex] = targetRow;
            }
            // If row doesn't exist, skip it (edit mode doesn't create new rows)
          });

          setRows(updatedRows);
        } else {
          // Create mode: Can create new rows (expandable)
          const newRows = [...rows];

          parsedRows.forEach((rowText, rowOffset) => {
            const cells = rowText;
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

          setRows(newRows);
        }
      } else {
        // Simple single-cell paste - just update the cell value
        updateCell(rowId, columnId, pastedText);
      }
    },
    [columns, rows, updateCell, setRows, mode, idColumnId, onRowUpdated],
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

      // Parse delimited text (CSV or TSV, auto-detected)
      const parsedRows = parseDelimitedText(text);

      if (parsedRows.length === 0) return; // Nothing to paste

      // Check if we have a header row
      const { hasHeaderRow, headerColumnMap } = detectHeaderRow(
        parsedRows[0],
        columns,
      );

      // Convert to table rows (normalized)
      const pastedRows = convertTsvToRows(
        parsedRows,
        columns,
        hasHeaderRow,
        headerColumnMap,
      );

      if (mode === 'edit') {
        // Edit mode: Match by numeric ID and update existing rows
        const updatedRows = rows.map((existingRow) => {
          // Extract numeric domain ID from existing row
          const existingDomainId = Number(existingRow.cells[idColumnId]);
          if (Number.isNaN(existingDomainId)) {
            // No valid ID, skip this row
            return existingRow;
          }

          // Find matching pasted row by numeric ID
          const pastedRow = pastedRows.find((pRow) => {
            const pastedDomainId = Number(pRow.cells[idColumnId]);
            return (
              !Number.isNaN(pastedDomainId) &&
              pastedDomainId === existingDomainId
            );
          });

          if (!pastedRow) {
            // No matching paste data for this row
            return existingRow;
          }

          // Merge pasted data into existing row (preserve existing row ID)
          const mergedCells = { ...existingRow.cells, ...pastedRow.cells };

          // Check if row changed
          const hasChanged = !cellsEqual(existingRow.cells, mergedCells);

          if (hasChanged) {
            // Mark row as dirty (callback with both string row ID and numeric domain ID)
            const domainId = Number(mergedCells[idColumnId]);
            if (!Number.isNaN(domainId)) {
              onRowUpdated?.(existingRow.id, domainId);
            }
          }

          return {
            ...existingRow, // Preserve string row ID
            cells: mergedCells,
          };
        });

        setRows(updatedRows);
      } else {
        // Create mode: Always create new rows (expandable)
        const existingRows = rows.filter((row) => row.id !== GHOST_ROW_ID);
        setRows([...existingRows, ...pastedRows]);
      }
    },
    [activeCell, columns, rows, handleCellPaste, setRows, mode, idColumnId, onRowUpdated],
  );

  return {
    activeCell,
    setActiveCellInfo,
    clearActiveCellInfo,
    handlePaste,
  };
}
