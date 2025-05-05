import type { ClipboardEvent } from 'react';
import type { TableColumn, TableRow } from '../types';
import { createTypedMock } from '@testing/utils/typedMock';

// Define the hook result interface
export interface TablePasteResult {
  setActiveCellInfo: (rowId: string, columnId: string) => void;
  clearActiveCellInfo: () => void;
  handlePaste: (e: ClipboardEvent<Element>) => void;
}

// Factory function to create mock results
export const createMockTablePasteResult = (): TablePasteResult => {
  return {
    setActiveCellInfo: createTypedMock<
      (rowId: string, columnId: string) => void
    >().mockImplementation(() => {}),
    clearActiveCellInfo: createTypedMock<() => void>().mockImplementation(
      () => {},
    ),
    handlePaste: createTypedMock<
      (e: ClipboardEvent<Element>) => void
    >().mockImplementation(() => {}),
  };
};

// Main mock function for the hook
export const mockUseTablePaste = createTypedMock<
  (options: {
    columns: TableColumn[];
    rows: TableRow[];
    updateCell: (rowId: string, columnId: string, value: string) => void;
    setRows: React.Dispatch<React.SetStateAction<TableRow[]>>;
  }) => TablePasteResult
>().mockImplementation(() => createMockTablePasteResult());
