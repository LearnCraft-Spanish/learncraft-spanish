import type {
  TableHook,
  TableRow,
  ValidationState,
} from '@application/units/PasteTable/types';
import type { CreateNonVerbVocabulary } from '@learncraft-spanish/shared';
import type { ClipboardEvent } from 'react';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { VOCABULARY_COLUMNS } from './constants';

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

// Default validation state (valid)
const defaultValidationState: ValidationState = {
  isValid: true,
  errors: {},
};

// Default mock implementation that provides happy-path data
export const defaultMockResult: TableHook<CreateNonVerbVocabulary> = {
  // Core data structure
  data: {
    rows: [defaultRow],
    columns: VOCABULARY_COLUMNS,
  },

  // Core operations
  updateCell: (_rowId: string, _columnId: string, _value: string) => null,
  saveData: () =>
    Promise.resolve([
      {
        word: 'hola',
        descriptor: 'hello',
        frequency: 100,
        notes: 'greeting',
        subcategoryId: 1,
      },
    ]),
  resetTable: () => {},

  // Data import
  importData: (_data: CreateNonVerbVocabulary[]) => {},
  handlePaste: (_e: ClipboardEvent<Element>) => {},

  // Cell focus tracking
  setActiveCellInfo: (_rowId: string, _columnId: string) => {},
  clearActiveCellInfo: () => {},

  // State flags and validation
  isSaveEnabled: true,
  validationState: defaultValidationState,
};

// Create an overrideable mock with the default implementation
export const {
  mock: mockUseVocabularyTable,
  override: overrideMockUseVocabularyTable,
  reset: resetMockUseVocabularyTable,
} = createOverrideableMock<() => TableHook<CreateNonVerbVocabulary>>(
  () => defaultMockResult,
);

// Export default for global mocking
export default mockUseVocabularyTable;
