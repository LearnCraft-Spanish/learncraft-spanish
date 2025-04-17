import type { TableHook } from '../../../application/units/types';
import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * Interface defining the contract between the application layer and UI components
 */
export interface PasteTablePort {
  // Data
  rows: any[];
  columns: any[];
  isSaveEnabled: boolean;

  // UI state
  activeCell: { rowId: string; columnId: string } | null;
  tableStyle: React.CSSProperties;

  // Event handlers
  handlePaste: (e: React.ClipboardEvent) => void;
  resetTable: () => void;
  saveData: () => Promise<any[] | undefined>;

  // Cell handling
  cellHandlers: {
    onChange: (rowId: string, columnId: string, value: string) => void;
    onFocus: (rowId: string, columnId: string) => void;
    onBlur: () => void;
  };

  // Utilities
  registerCellRef: (
    key: string,
    element: HTMLInputElement | HTMLSelectElement | null,
  ) => void;
  getAriaLabel: (columnId: string, rowId: string) => string;
  focusCell: (rowId: string, columnId: string) => void;
}

/**
 * Hook that adapts the application TableHook for the UI components
 */
export function usePasteTable<T>(hook: TableHook<T>): PasteTablePort {
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

    // UI utilities
    cellHandlers,
    registerCellRef,
    getAriaLabel,
    focusCell,
  };
}
