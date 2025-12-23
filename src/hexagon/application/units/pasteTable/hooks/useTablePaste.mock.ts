import type { TableColumn, TableRow } from '@domain/PasteTable/General';
import type { ClipboardEvent } from 'react';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Define the hook result interface
export interface TablePasteResult {
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;
  handlePaste: (e: ClipboardEvent<Element>) => void;
}

// Factory function to create mock results
export const createMockTablePasteResult = (): TablePasteResult => {
  return {
    setActiveCellInfo: (_rowId: string, _columnId: string) => {},
    clearActiveCellInfo: () => {},
    handlePaste: (_e: ClipboardEvent<Element>) => {},
  };
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseTablePaste,
  override: overrideMockUseTablePaste,
  reset: resetMockUseTablePaste,
} = createOverrideableMock<
  (options: {
    columns: TableColumn[];
    rows: TableRow[];
    updateCell: (rowId: string, columnId: string, value: string) => void;
    setRows: React.Dispatch<React.SetStateAction<TableRow[]>>;
  }) => TablePasteResult
>(() => createMockTablePasteResult());

// Export the default result for component testing
export { createMockTablePasteResult as defaultResult };
