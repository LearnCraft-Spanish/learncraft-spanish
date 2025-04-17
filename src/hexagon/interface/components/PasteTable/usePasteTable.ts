import type { TableHook } from '../../../application/units/types';
import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * Find the index of a row or column in an array
 */
function findIndex<T>(array: T[], predicate: (item: T) => boolean): number {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
}

/**
 * Hook that adapts the application TableHook for the UI components
 */
export function usePasteTable<T>(hook: TableHook<T>) {
  // UI state - track which cell is active/focused
  const [activeCell, setActiveCell] = useState<{
    rowId: string;
    columnId: string;
  } | null>(null);

  // Create a ref map for cell input elements
  const cellRefs = useRef<Map<string, HTMLInputElement | HTMLSelectElement>>(
    new Map(),
  );

  // Process column widths for grid template
  const gridTemplateColumnsValue = useMemo(() => {
    return hook.data.columns
      .map((col) => {
        const width = col.width || '1fr';
        // Ensure width has a valid CSS unit
        return width.endsWith('fr') ||
          width.endsWith('px') ||
          width.endsWith('%')
          ? width
          : `${width}fr`;
      })
      .join(' ');
  }, [hook.data.columns]);

  // Create inline style with CSS variable for grid
  const tableStyle = useMemo(() => {
    return {
      '--grid-template-columns': gridTemplateColumnsValue,
    } as React.CSSProperties;
  }, [gridTemplateColumnsValue]);

  // Cell registration function for refs
  const registerCellRef = useCallback(
    (key: string, element: HTMLInputElement | HTMLSelectElement | null) => {
      if (element) {
        cellRefs.current.set(key, element);
      } else {
        cellRefs.current.delete(key);
      }
    },
    [],
  );

  // Focus handling function
  const focusCell = useCallback((rowId: string, columnId: string) => {
    const cellKey = `${rowId}-${columnId}`;
    const element = cellRefs.current.get(cellKey);

    if (element) {
      element.focus();

      // If input element, move cursor to end
      if (element instanceof HTMLInputElement && element.value) {
        const length = element.value.length;
        element.setSelectionRange(length, length);
      }
    }
  }, []);

  // Generate aria labels
  const getAriaLabel = useCallback(
    (columnId: string, rowId: string) => {
      const column = hook.data.columns.find((col) => col.id === columnId);
      return `${column?.label || columnId} input for row ${rowId}`;
    },
    [hook.data.columns],
  );

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!activeCell) return;

      // Get current indices
      const rowIndex = findIndex(
        hook.data.rows,
        (row) => row.id === activeCell.rowId,
      );
      const colIndex = findIndex(
        hook.data.columns,
        (col) => col.id === activeCell.columnId,
      );

      if (rowIndex === -1 || colIndex === -1) return;

      const rows = hook.data.rows;
      const columns = hook.data.columns;

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
        case 'ArrowLeft':
          if (
            e.ctrlKey ||
            e.metaKey ||
            // Only move left if at start of input or selection is at start
            (e.target instanceof HTMLInputElement &&
              e.target.selectionStart === 0 &&
              e.target.selectionEnd === 0)
          ) {
            if (colIndex > 0) {
              nextColIndex = colIndex - 1;
              e.preventDefault();
            } else if (rowIndex > 0) {
              // Wrap to end of previous row
              nextRowIndex = rowIndex - 1;
              nextColIndex = columns.length - 1;
              e.preventDefault();
            }
          }
          break;
        case 'ArrowRight':
          if (
            e.ctrlKey ||
            e.metaKey ||
            // Only move right if at end of input or selection is at end
            (e.target instanceof HTMLInputElement &&
              e.target.selectionStart === e.target.value.length &&
              e.target.selectionEnd === e.target.value.length)
          ) {
            if (colIndex < columns.length - 1) {
              nextColIndex = colIndex + 1;
              e.preventDefault();
            } else if (rowIndex < rows.length - 1) {
              // Wrap to start of next row
              nextRowIndex = rowIndex + 1;
              nextColIndex = 0;
              e.preventDefault();
            }
          }
          break;
        case 'Tab':
          if (!e.shiftKey) {
            // Tab forward
            if (colIndex < columns.length - 1) {
              nextColIndex = colIndex + 1;
            } else if (rowIndex < rows.length - 1) {
              nextRowIndex = rowIndex + 1;
              nextColIndex = 0;
            }
          } else {
            // Shift+Tab backward
            if (colIndex > 0) {
              nextColIndex = colIndex - 1;
            } else if (rowIndex > 0) {
              nextRowIndex = rowIndex - 1;
              nextColIndex = columns.length - 1;
            }
          }
          // Only prevent default if we're navigating within the table
          if (nextRowIndex !== rowIndex || nextColIndex !== colIndex) {
            e.preventDefault();
          }
          break;
        case 'Enter':
          if (e.shiftKey) {
            // Shift+Enter - move up
            if (rowIndex > 0) {
              nextRowIndex = rowIndex - 1;
              e.preventDefault();
            }
          } else {
            // Enter - move down
            if (rowIndex < rows.length - 1) {
              nextRowIndex = rowIndex + 1;
              e.preventDefault();
            }
          }
          break;
        default:
          return; // Don't handle other keys
      }

      // If position changed, focus the new cell
      if (nextRowIndex !== rowIndex || nextColIndex !== colIndex) {
        const nextRow = rows[nextRowIndex];
        const nextColumn = columns[nextColIndex];

        if (nextRow && nextColumn) {
          focusCell(nextRow.id, nextColumn.id);
        }
      }
    },
    [activeCell, hook.data.rows, hook.data.columns, focusCell],
  );

  // Cell event handlers grouped together
  const cellHandlers = useMemo(
    () => ({
      onFocus: (rowId: string, columnId: string) => {
        setActiveCell({ rowId, columnId });
        hook.setActiveCellInfo(rowId, columnId);
      },
      onBlur: () => {
        setActiveCell(null);
        hook.clearActiveCellInfo();
      },
      onChange: (rowId: string, columnId: string, value: string) => {
        // Call updateCell and get the new row ID if a ghost row was converted
        const newRowId = hook.updateCell(rowId, columnId, value);

        // If a new row was created (ghost row was converted), focus it
        if (newRowId) {
          setActiveCell({ rowId: newRowId, columnId });
          // Use requestAnimationFrame instead of setTimeout for better timing with React
          requestAnimationFrame(() => {
            focusCell(newRowId, columnId);
          });
        }
      },
    }),
    [hook, focusCell],
  );

  return {
    // Data from hook
    rows: hook.data.rows,
    columns: hook.data.columns,
    isSaveEnabled: hook.isSaveEnabled,

    // UI state
    activeCell,
    tableStyle,

    // Events from hook
    handlePaste: hook.handlePaste,
    resetTable: hook.resetTable,
    saveData: hook.saveData,
    handleKeyDown,

    // UI utilities
    cellHandlers,
    registerCellRef,
    getAriaLabel,
    focusCell,
  };
}
