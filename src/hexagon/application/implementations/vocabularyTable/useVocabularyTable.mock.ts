import type {
  TableHook,
  TableRow,
  ValidationState,
} from '@application/units/pasteTable/types';
import type { CreateNonVerbVocabulary } from '@LearnCraft-Spanish/shared';
import type { ClipboardEvent } from 'react';
import { createTypedMock } from '@testing/utils/typedMock';
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
const defaultMockResult: TableHook<CreateNonVerbVocabulary> = {
  // Core data structure
  data: {
    rows: [defaultRow],
    columns: VOCABULARY_COLUMNS,
  },

  // Core operations
  updateCell: createTypedMock<
    (rowId: string, columnId: string, value: string) => string | null
  >().mockImplementation(() => null),
  saveData: createTypedMock<
    () => Promise<CreateNonVerbVocabulary[] | undefined>
  >().mockResolvedValue([
    {
      word: 'hola',
      descriptor: 'hello',
      frequency: 100,
      notes: 'greeting',
      subcategoryId: 1,
    },
  ]),
  resetTable: createTypedMock<() => void>().mockImplementation(() => {}),

  // Data import
  importData: createTypedMock<
    (data: CreateNonVerbVocabulary[]) => void
  >().mockImplementation(() => {}),
  handlePaste: createTypedMock<
    (e: ClipboardEvent<Element>) => void
  >().mockImplementation(() => {}),

  // Cell focus tracking
  setActiveCellInfo: createTypedMock<
    (rowId: string, columnId: string) => void
  >().mockImplementation(() => {}),
  clearActiveCellInfo: createTypedMock<() => void>().mockImplementation(
    () => {},
  ),

  // State flags and validation
  isSaveEnabled: true,
  validationState: defaultValidationState,
};

// Create the mock hook with default implementation
export const mockUseVocabularyTable =
  createTypedMock<() => TableHook<CreateNonVerbVocabulary>>().mockReturnValue(
    defaultMockResult,
  );

// Setup function to configure the mock for tests
export const overrideMockUseVocabularyTable = (
  config: Partial<TableHook<CreateNonVerbVocabulary>> = {},
) => {
  // Create a new result with defaults and overrides
  const mockResult = {
    ...defaultMockResult,
    ...config,
    // Allow partial override of nested data structure
    data: {
      ...defaultMockResult.data,
      ...(config.data || {}),
    },
    // Allow partial override of nested validation state
    validationState: {
      ...defaultMockResult.validationState,
      ...(config.validationState || {}),
    },
  };

  // Reset and configure the mock
  mockUseVocabularyTable.mockReturnValue(mockResult);
  return mockResult;
};

// Helper to call the mock during tests
export const callMockUseVocabularyTable = () => mockUseVocabularyTable();

// Export default for global mocking
export default mockUseVocabularyTable;
