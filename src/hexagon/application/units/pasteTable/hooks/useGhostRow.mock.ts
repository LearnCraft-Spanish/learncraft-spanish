import type { TableColumn, TableRow } from '../types';
import { createTypedMock } from '@testing/utils/typedMock';

// Define the hook result interface
export interface GhostRowResult {
  convertGhostRow: (
    rowId: string,
    columnId: string,
    value: string,
  ) => string | null;
  ensureGhostRow: (rows: TableRow[]) => TableRow[];
}

// Factory function to create mock results
export const createMockGhostRowResult = (options?: {
  newRowId?: string;
}): GhostRowResult => {
  return {
    convertGhostRow: createTypedMock<
      (rowId: string, columnId: string, value: string) => string | null
    >().mockImplementation(() => options?.newRowId || 'ghost-converted-row-id'),
    ensureGhostRow: createTypedMock<
      (rows: TableRow[]) => TableRow[]
    >().mockImplementation((rows) => rows),
  };
};

// Main mock function for the hook
export const mockUseGhostRow = createTypedMock<
  (props: {
    columns: TableColumn[];
    setRows: (rowsUpdater: (rows: TableRow[]) => TableRow[]) => void;
  }) => GhostRowResult
>().mockImplementation(() => createMockGhostRowResult());
