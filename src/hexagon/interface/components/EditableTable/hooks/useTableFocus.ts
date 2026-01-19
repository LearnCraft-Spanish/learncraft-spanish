import { useCallback, useRef } from 'react';

/**
 * Hook for managing cell focus and refs in EditableTable
 * 
 * PURPOSE:
 * - Provides programmatic focus control for table cells (keyboard navigation, ghost row conversion)
 * - Maintains a registry of all cell DOM elements for efficient lookup by rowId/columnId
 * 
 * USAGE:
 * 1. Table component calls `createCellRef(rowId, columnId)` for each cell
 * 2. Cell components attach the ref to their input element
 * 3. When focus is needed (e.g., arrow key pressed), call `focusCell(rowId, columnId)`
 * 
 * WHY A MAP:
 * - Tables can have 100s of cells; a Map is more efficient than individual refs
 * - Allows dynamic lookup by rowId/columnId without knowing structure ahead of time
 */
export function useTableFocus() {
  // Registry of all cell DOM elements, keyed by "rowId-columnId"
  // Persists across renders (useRef), updated via ref callbacks
  const cellRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Internal function to add/remove cells from the registry
  // Called by the ref callback when cells mount/unmount
  const registerCellRef = useCallback(
    (key: string, element: HTMLElement | null) => {
      if (element) {
        // Cell mounted: add to registry
        cellRefs.current.set(key, element);
      } else {
        // Cell unmounted: remove from registry
        cellRefs.current.delete(key);
      }
    },
    [],
  );

  // Programmatically focus a cell by its row and column ID
  // Used by: keyboard navigation, ghost row conversion, paste operations
  const focusCell = useCallback((rowId: string, columnId: string) => {
    const cellKey = `${rowId}-${columnId}`;
    const element = cellRefs.current.get(cellKey);

    if (element) {
      // Move DOM focus to the element
      element.focus();
      
      // For text inputs, position cursor at the end of existing value
      // NOTE: Only works for type="text"; number/email/etc don't support selection
      if (element instanceof HTMLInputElement && element.value) {
        const length = element.value.length;
        element.setSelectionRange(length, length);
      }
    }
  }, []);

  // Create a ref callback for a specific cell
  // Returns a function that React calls when the cell mounts/unmounts
  // PATTERN: Cell component does <input ref={createCellRef(rowId, columnId)} />
  const createCellRef = useCallback(
    (rowId: string, columnId: string) => (element: HTMLElement | null) => {
      const key = `${rowId}-${columnId}`;
      registerCellRef(key, element);
    },
    [registerCellRef],
  );

  return {
    focusCell, // Call to programmatically focus a cell
    createCellRef, // Attach to cell elements to register them
  };
}
