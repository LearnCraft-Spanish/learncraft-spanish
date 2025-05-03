import type { TableHook } from '@hexagon/application/units/pasteTable/types';
import type { MockInstance } from 'vitest';
import { usePasteTable } from '@hexagon/application/units/pasteTable';
import { validateCreateNonVerbVocabulary } from '@LearnCraft-Spanish/shared';
import { renderHook } from '@testing-library/react';
import { createTypedMock } from '@testing/utils/typedMock';
import { vi } from 'vitest';
import { VOCABULARY_COLUMNS } from './constants';
import { useVocabularyTable } from './useVocabularyTable';

// Type for the config parameter to improve type safety
interface PasteTableConfig {
  columns: any[];
  validateRow: (row: any) => Record<string, string>;
}

// Mock the usePasteTable hook that this implementation depends on
vi.mock('@hexagon/application/units/pasteTable', () => ({
  usePasteTable: createTypedMock<
    (config: PasteTableConfig) => any
  >().mockImplementation((config) => ({
    // Return a minimal implementation for the test
    data: {
      rows: [],
      columns: config.columns,
    },
    updateCell:
      createTypedMock<
        (rowId: string, columnId: string, value: string) => string | null
      >(),
    saveData: createTypedMock<() => Promise<any[]>>().mockResolvedValue([]),
    resetTable: createTypedMock<() => void>(),
    importData: createTypedMock<(data: any[]) => void>(),
    handlePaste: createTypedMock<(e: any) => void>(),
    setActiveCellInfo:
      createTypedMock<(rowId: string, columnId: string) => void>(),
    clearActiveCellInfo: createTypedMock<() => void>(),
    isSaveEnabled: true,
    validationState: { isValid: true, errors: {} },
  })),
}));

// Mock the shared library's validation function
vi.mock('@LearnCraft-Spanish/shared', async () => {
  const actual = await vi.importActual('@LearnCraft-Spanish/shared');
  return {
    ...actual,
    validateCreateNonVerbVocabulary: createTypedMock<
      (data: any) => { valid: boolean; errors: string[] }
    >().mockImplementation((data) => {
      const errors = [];

      // Basic validation logic
      if (!data.word) errors.push('word: Word is required');
      if (!data.descriptor) errors.push('descriptor: Descriptor is required');
      if (
        data.frequency !== undefined &&
        (Number.isNaN(data.frequency) || data.frequency < 1)
      ) {
        errors.push('frequency: Frequency must be a positive number');
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    }),
  };
});

describe('useVocabularyTable', () => {
  // We'll store references to mocked functions
  let usePasteTableMock: MockInstance;
  let validateCreateNonVerbVocabularyMock: MockInstance;

  beforeEach(() => {
    // Get references to mocked functions before each test
    usePasteTableMock = vi.mocked(usePasteTable);
    validateCreateNonVerbVocabularyMock = vi.mocked(
      validateCreateNonVerbVocabulary,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return a TableHook with correct columns', () => {
    // Render the hook
    const { result } = renderHook(() => useVocabularyTable());

    // Verify that columns are passed correctly
    expect(result.current.data.columns).toBe(VOCABULARY_COLUMNS);
  });

  it('should validate rows properly with valid data', () => {
    // Render the hook to trigger the call to usePasteTable
    renderHook(() => useVocabularyTable());

    // Extract the validateRow function that was passed to usePasteTable
    const validateRowFn = usePasteTableMock.mock.calls[0][0].validateRow;

    // Test with valid data
    const validRow = {
      word: 'casa',
      descriptor: 'house',
      frequency: '100',
    };

    const errors = validateRowFn(validRow);
    expect(errors).toEqual({});
  });

  it('should validate rows properly with invalid data - missing descriptor', () => {
    // Render the hook
    renderHook(() => useVocabularyTable());

    // Extract the validateRow function
    const validateRowFn = usePasteTableMock.mock.calls[0][0].validateRow;

    // Test with invalid data (missing descriptor)
    const invalidRow = {
      word: 'casa',
      // Missing descriptor
      frequency: '100',
    };

    const errors = validateRowFn(invalidRow);

    // Should have an error for the descriptor field
    expect(errors).toHaveProperty('descriptor');
  });

  it('should validate rows properly with invalid data - invalid frequency', () => {
    // Render the hook
    renderHook(() => useVocabularyTable());

    // Extract the validateRow function
    const validateRowFn = usePasteTableMock.mock.calls[0][0].validateRow;

    // Test with invalid frequency
    const invalidRow = {
      word: 'casa',
      descriptor: 'house',
      frequency: '-10', // Negative frequency is invalid
    };

    const errors = validateRowFn(invalidRow);

    // Should have an error for the frequency field
    expect(errors).toHaveProperty('frequency');
  });

  it('should convert frequency to a number for validation', () => {
    // Render the hook
    renderHook(() => useVocabularyTable());

    // Extract the validateRow function
    const validateRowFn = usePasteTableMock.mock.calls[0][0].validateRow;

    // Call with string frequency
    validateRowFn({
      word: 'casa',
      descriptor: 'house',
      frequency: '100',
    });

    // Verify the frequency was converted to a number
    expect(validateCreateNonVerbVocabularyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: 100, // Should be a number, not a string
      }),
    );
  });
});
