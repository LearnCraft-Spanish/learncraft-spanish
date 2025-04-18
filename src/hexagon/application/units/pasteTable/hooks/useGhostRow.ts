import type { TableColumn, TableRow } from '../types';
import { useCallback } from 'react';
import { GHOST_ROW_ID } from '../types';
import { createGhostRow, generateRowId } from '../utils';

interface UseGhostRowProps {
  columns: TableColumn[];
  setRows: (rowsUpdater: (rows: TableRow[]) => TableRow[]) => void;
}

export function useGhostRow({ columns, setRows }: UseGhostRowProps) {
  // Convert ghost row to regular row when data is entered
  const convertGhostRow = useCallback(
    (rowId: string, columnId: string, value: string) => {
      if (rowId !== GHOST_ROW_ID || value.trim() === '') {
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

      // Create a new row ID for the converted row
      const newRowId = generateRowId();

      // Create a new regular row from the ghost row
      const newRegularRow: TableRow = {
        id: newRowId,
        cells: newCells,
      };

      // Use setRows to ensure a single atomic update that adds both the new row
      // and ensures exactly one ghost row
      setRows((currentRows: TableRow[]) => {
        const nonGhostRows = currentRows.filter(
          (row: TableRow) => row.id !== GHOST_ROW_ID,
        );
        return [...nonGhostRows, newRegularRow, createGhostRow(columns)];
      });

      // Return the new row ID for focus management
      return newRowId;
    },
    [columns, setRows],
  );

  // Ensure there's a ghost row at the end of the table
  const ensureGhostRow = useCallback(
    (rows: TableRow[]) => {
      const hasGhostRow = rows.some((row) => row.id === GHOST_ROW_ID);
      if (!hasGhostRow) {
        return [...rows, createGhostRow(columns)];
      }
      return rows;
    },
    [columns],
  );

  return {
    convertGhostRow,
    ensureGhostRow,
  };
}
