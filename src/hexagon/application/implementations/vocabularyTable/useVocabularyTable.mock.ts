import type { CreateTableStateHook } from '@application/units/pasteTable/useCreateTableState';
import type { TableRow } from '@domain/PasteTable';
import type { ClipboardEvent } from 'react';
import { VOCABULARY_COLUMNS } from '@application/implementations/vocabularyTable/constants';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

// Default row for testing
const defaultRow: TableRow = {
  id: 'row-1',
  cells: {
    word: 'hola',
    descriptor: 'hello',
    frequency: '100',
    notes: 'greeting',
  },
};

// Default mock implementation that provides happy-path data
export const defaultMockResult: CreateTableStateHook = {
  // Core data structure
  data: {
    rows: [defaultRow],
    columns: VOCABULARY_COLUMNS,
  },

  // Core operations
  updateCell: (_rowId: string, _columnId: string, _value: string) => null,
  resetTable: () => {},

  // Data import
  handlePaste: (_e: ClipboardEvent<Element>) => {},

  // Cell focus tracking
  setActiveCellInfo: (_rowId: string, _columnId: string) => {},
  clearActiveCellInfo: () => {},

  // Expose rows for use case to map
  getRows: () => [defaultRow],
  setRows: (
    _rows: TableRow[] | ((currentRows: TableRow[]) => TableRow[]),
  ) => {},
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseVocabularyTable,
  override: overrideMockUseVocabularyTable,
  reset: resetMockUseVocabularyTable,
} = createOverrideableMock<() => CreateTableStateHook>(() => defaultMockResult);

// Export default for global mocking
export default mockUseVocabularyTable;
