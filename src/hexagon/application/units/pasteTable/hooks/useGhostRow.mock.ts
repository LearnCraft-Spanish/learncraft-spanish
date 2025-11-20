import type { TableColumn, TableRow } from '@domain/PasteTable/General';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

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
    convertGhostRow: (_rowId: string, _columnId: string, _value: string) =>
      options?.newRowId || 'ghost-converted-row-id',
    ensureGhostRow: (rows: TableRow[]) => rows,
  };
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseGhostRow,
  override: overrideMockUseGhostRow,
  reset: resetMockUseGhostRow,
} = createOverrideableMock<
  (props: {
    columns: TableColumn[];
    setRows: (rowsUpdater: (rows: TableRow[]) => TableRow[]) => void;
  }) => GhostRowResult
>(() => createMockGhostRowResult());

// Export the default result for component testing
export { createMockGhostRowResult as defaultResult };
