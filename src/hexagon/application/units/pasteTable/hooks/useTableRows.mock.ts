import type { TableColumn, TableRow } from '../types';
import { createTypedMock } from '@testing/utils/typedMock';
import { GHOST_ROW_ID } from '../types';

// Define the hook result interface
export interface TableRowsResult<_T> {
  rows: TableRow[];
  updateCell: (rowId: string, columnId: string, value: string) => void;
  setRows: React.Dispatch<React.SetStateAction<TableRow[]>>;
  resetRows: () => void;
  convertGhostRow: (
    rowId: string,
    columnId: string,
    value: string,
  ) => string | null;
}

// Default mock data
const defaultRow: TableRow = {
  id: 'row-1',
  cells: {
    column1: 'value1',
    column2: 'value2',
  },
};

const ghostRow: TableRow = {
  id: GHOST_ROW_ID,
  cells: {
    column1: '',
    column2: '',
  },
};

// Factory function to create mock results
export const createMockTableRowsResult = <_T>(options?: {
  rows?: TableRow[];
}): TableRowsResult<_T> => {
  return {
    rows: options?.rows || [defaultRow, ghostRow],
    updateCell: createTypedMock<
      (rowId: string, columnId: string, value: string) => void
    >().mockImplementation(() => {}),
    setRows: createTypedMock<
      React.Dispatch<React.SetStateAction<TableRow[]>>
    >().mockImplementation(() => {}),
    resetRows: createTypedMock<() => void>().mockImplementation(() => {}),
    convertGhostRow: createTypedMock<
      (rowId: string, columnId: string, value: string) => string | null
    >().mockImplementation(() => 'new-row-id'),
  };
};

// Main mock function for the hook
export const mockUseTableRows = createTypedMock<
  <T>(options: {
    columns: TableColumn[];
    initialData?: T[];
  }) => TableRowsResult<T>
>().mockImplementation(() => createMockTableRowsResult());
