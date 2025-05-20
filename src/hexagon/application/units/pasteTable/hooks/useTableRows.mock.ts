import type { TableColumn, TableRow } from '../types';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
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
    updateCell: (_rowId: string, _columnId: string, _value: string) => {},
    setRows: () => {},
    resetRows: () => {},
    convertGhostRow: (_rowId: string, _columnId: string, _value: string) =>
      'new-row-id',
  };
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseTableRows,
  override: overrideMockUseTableRows,
  reset: resetMockUseTableRows,
} = createOverrideableMock<
  <T>(options: {
    columns: TableColumn[];
    initialData?: T[];
  }) => TableRowsResult<T>
>(() => createMockTableRowsResult());

// Export the default result for component testing
export { createMockTableRowsResult as defaultResult };
