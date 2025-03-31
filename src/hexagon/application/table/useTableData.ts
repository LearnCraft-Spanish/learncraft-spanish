import type { ClipboardEvent } from 'react';
import type { TableColumn, TableData, TableHook, TableRow } from './types';
import { useCallback, useState } from 'react';

interface UseTableDataOptions<T> {
  columns: TableColumn[];
  validateRow: (row: T) => Record<string, string>;
}

/** ID used to identify the empty row at the bottom of the table */
const GHOST_ROW_ID = 'ghost-row';

export function useTableData<T>({
  columns,
  validateRow,
}: UseTableDataOptions<T>): TableHook<T> {
  const [data, setData] = useState<TableData>({
    rows: [
      {
        id: GHOST_ROW_ID,
        cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
      },
    ],
  });

  const [isValid, setIsValid] = useState(true);

  const handlePaste = useCallback(
    (e: ClipboardEvent<Element>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text');
      const rows = text.split('\n').map((row) => row.split('\t'));

      const newRows: TableRow[] = rows.map((cells, index) => ({
        id: `row-${Date.now()}-${index}`,
        cells: cells.reduce(
          (acc, cell, colIndex) => {
            acc[columns[colIndex]?.id || ''] = cell;
            return acc;
          },
          {} as Record<string, string>,
        ),
      }));

      setData((prev) => ({
        rows: [
          ...prev.rows.filter((row) => row.id !== GHOST_ROW_ID),
          ...newRows,
          {
            id: GHOST_ROW_ID,
            cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
          },
        ],
      }));
    },
    [columns],
  );

  const handleCellChange = useCallback(
    (rowId: string, columnId: string, value: string) => {
      setData((prev) => ({
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
      }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    const rows = data.rows.filter((row) => row.id !== GHOST_ROW_ID);
    const errors: Record<string, Record<string, string>> = {};

    rows.forEach((row) => {
      const rowData = row.cells as T;
      const rowErrors = validateRow(rowData);
      if (Object.keys(rowErrors).length > 0) {
        errors[row.id] = rowErrors;
      }
    });

    setIsValid(Object.keys(errors).length === 0);

    if (Object.keys(errors).length === 0) {
      return rows.map((row) => row.cells as T);
    }
    return undefined;
  }, [data.rows, validateRow]);

  const clearTable = useCallback(() => {
    setData({
      rows: [
        {
          id: GHOST_ROW_ID,
          cells: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {}),
        },
      ],
    });
    setIsValid(true);
  }, [columns]);

  const isSaveEnabled = isValid && data.rows.length > 0;

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
