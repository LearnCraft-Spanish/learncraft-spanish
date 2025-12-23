import { useCallback, useRef } from 'react';

/**
 * Hook for managing cell focus and refs in EditableTable
 */
export function useTableFocus() {
  const cellRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerCellRef = useCallback(
    (key: string, element: HTMLElement | null) => {
      if (element) {
        cellRefs.current.set(key, element);
      } else {
        cellRefs.current.delete(key);
      }
    },
    [],
  );

  const focusCell = useCallback((rowId: string, columnId: string) => {
    const cellKey = `${rowId}-${columnId}`;
    const element = cellRefs.current.get(cellKey);

    if (element) {
      element.focus();
      if (element instanceof HTMLInputElement && element.value) {
        const length = element.value.length;
        element.setSelectionRange(length, length);
      }
    }
  }, []);

  const createCellRef = useCallback(
    (rowId: string, columnId: string) => (element: HTMLElement | null) => {
      const key = `${rowId}-${columnId}`;
      registerCellRef(key, element);
    },
    [registerCellRef],
  );

  return {
    focusCell,
    createCellRef,
  };
}
