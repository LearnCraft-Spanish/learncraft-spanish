import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import { useCallback } from 'react';

// Helper function to find index in array
function findIndex<T>(array: T[], predicate: (item: T) => boolean): number {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
}

interface UseTableKeyboardNavigationOptions {
  rows: TableRow[];
  columns: ColumnDefinition[];
  activeCell: { rowId: string; columnId: string } | null;
  focusCell: (rowId: string, columnId: string) => void;
}

/**
 * Hook for handling keyboard navigation in EditableTable
 */
export function useTableKeyboardNavigation({
  rows,
  columns,
  activeCell,
  focusCell,
}: UseTableKeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!activeCell) return;

      const rowIndex = findIndex(rows, (row) => row.id === activeCell.rowId);
      const colIndex = findIndex(
        columns,
        (col) => col.id === activeCell.columnId,
      );

      if (rowIndex === -1 || colIndex === -1) return;

      let nextRowIndex = rowIndex;
      let nextColIndex = colIndex;

      // Handle arrow key navigation
      switch (e.key) {
        case 'ArrowUp':
          if (rowIndex > 0) {
            nextRowIndex = rowIndex - 1;
            e.preventDefault();
          }
          break;
        case 'ArrowDown':
          if (rowIndex < rows.length - 1) {
            nextRowIndex = rowIndex + 1;
            e.preventDefault();
          }
          break;
        case 'ArrowLeft': {
          const shouldNavigateLeft =
            e.ctrlKey ||
            e.metaKey ||
            (e.target instanceof HTMLInputElement &&
              e.target.type === 'number') ||
            (e.target instanceof HTMLInputElement &&
              e.target.type !== 'number' &&
              e.target.selectionStart === 0 &&
              e.target.selectionEnd === 0);

          if (shouldNavigateLeft) {
            if (colIndex > 0) {
              nextColIndex = colIndex - 1;
              e.preventDefault();
            } else if (rowIndex > 0) {
              nextRowIndex = rowIndex - 1;
              nextColIndex = columns.length - 1;
              e.preventDefault();
            }
          }
          break;
        }
        case 'ArrowRight': {
          const shouldNavigateRight =
            e.ctrlKey ||
            e.metaKey ||
            (e.target instanceof HTMLInputElement &&
              e.target.type === 'number') ||
            (e.target instanceof HTMLInputElement &&
              e.target.type !== 'number' &&
              e.target.selectionStart === e.target.value.length &&
              e.target.selectionEnd === e.target.value.length);

          if (shouldNavigateRight) {
            if (colIndex < columns.length - 1) {
              nextColIndex = colIndex + 1;
              e.preventDefault();
            } else if (rowIndex < rows.length - 1) {
              nextRowIndex = rowIndex + 1;
              nextColIndex = 0;
              e.preventDefault();
            }
          }
          break;
        }
        case 'Tab':
          if (!e.shiftKey) {
            if (colIndex < columns.length - 1) {
              nextColIndex = colIndex + 1;
            } else if (rowIndex < rows.length - 1) {
              nextRowIndex = rowIndex + 1;
              nextColIndex = 0;
            }
          } else {
            if (colIndex > 0) {
              nextColIndex = colIndex - 1;
            } else if (rowIndex > 0) {
              nextRowIndex = rowIndex - 1;
              nextColIndex = columns.length - 1;
            }
          }
          if (nextRowIndex !== rowIndex || nextColIndex !== colIndex) {
            e.preventDefault();
          }
          break;
        case 'Enter':
          if (e.shiftKey) {
            if (rowIndex > 0) {
              nextRowIndex = rowIndex - 1;
              e.preventDefault();
            }
          } else {
            if (rowIndex < rows.length - 1) {
              nextRowIndex = rowIndex + 1;
              e.preventDefault();
            }
          }
          break;
      }

      // Focus the new cell if position changed
      if (nextRowIndex !== rowIndex || nextColIndex !== colIndex) {
        const nextRow = rows[nextRowIndex];
        const nextColumn = columns[nextColIndex];
        if (nextRow && nextColumn) {
          focusCell(nextRow.id, nextColumn.id);
        }
      }
    },
    [activeCell, rows, columns, focusCell],
  );

  return { handleKeyDown };
}

