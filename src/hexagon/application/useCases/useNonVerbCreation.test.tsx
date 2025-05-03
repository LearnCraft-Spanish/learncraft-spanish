import { PartOfSpeech } from '@LearnCraft-Spanish/shared';
import { renderHook } from '@testing-library/react';
import { createMockSubcategory } from '@testing/factories/subcategoryFactories';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import { createTypedMock } from '@testing/utils/typedMock';
import { act } from 'react';
import { vi } from 'vitest';
import { mockUsePasteTable } from '../units/pasteTable/usePasteTable.mock';
import { mockUseSubcategories } from '../units/useSubcategories.mock';
import { mockUseVocabulary } from '../units/useVocabulary.mock';
import { mockUseVocabularyPage } from '../units/useVocabularyPage.mock';
import { VOCABULARY_COLUMNS } from '../units/useVocabularyTable';
import { mockUseVocabularyTable } from '../units/useVocabularyTable.mock';
import { useNonVerbCreation } from './useNonVerbCreation';

// Mock dependencies at the module level to isolate the unit under test
vi.mock('../units/useSubcategories', () => ({
  useSubcategories: mockUseSubcategories,
}));

vi.mock('../units/useVocabulary', () => ({
  useVocabulary: mockUseVocabulary,
}));

vi.mock('../units/pasteTable/usePasteTable', () => ({
  usePasteTable: mockUsePasteTable,
}));

vi.mock('../units/useVocabularyTable', () => ({
  useVocabularyTable: mockUseVocabularyTable,
  VOCABULARY_COLUMNS,
}));

vi.mock('../units/useVocabularyPage', () => ({
  useVocabularyPage: mockUseVocabularyPage,
}));

describe('useNonVerbCreation', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  it('should return non-verb subcategories', () => {
    // Arrange - Setup mocks with test data
    const verbSubcategory = createMockSubcategory({
      id: 1,
      name: 'Verb Subcategory',
      partOfSpeech: PartOfSpeech.Verb,
    });

    const nonVerbSubcategories = [
      createMockSubcategory({
        id: 2,
        name: 'Noun Subcategory',
        partOfSpeech: PartOfSpeech.Noun,
      }),
      createMockSubcategory({
        id: 3,
        name: 'Adjective Subcategory',
        partOfSpeech: PartOfSpeech.Adjective,
      }),
    ];

    // Configure mocks with our test data
    mockUseSubcategories.mockReturnValue({
      subcategories: [verbSubcategory, ...nonVerbSubcategories],
      loading: false,
      error: null,
      refetch: createTypedMock<() => void>().mockImplementation(() => {}),
    });

    // Act - Call the hook
    const { result } = renderHook(() => useNonVerbCreation());

    // Assert - Check the hook returns only non-verb subcategories
    expect(result.current.nonVerbSubcategories).toHaveLength(2);
    expect(result.current.nonVerbSubcategories).not.toContain(verbSubcategory);
    expect(result.current.nonVerbSubcategories).toEqual(nonVerbSubcategories);
  });

  it('should handle subcategory selection', () => {
    // Arrange
    mockUseSubcategories.mockReturnValue({
      subcategories: [
        createMockSubcategory({
          id: 2,
          name: 'Noun Subcategory',
          partOfSpeech: PartOfSpeech.Noun,
        }),
      ],
      loading: false,
      error: null,
      refetch: createTypedMock<() => void>().mockImplementation(() => {}),
    });

    // Act - Call the hook and select a subcategory
    const { result } = renderHook(() => useNonVerbCreation());

    act(() => {
      result.current.setSelectedSubcategoryId('2');
    });

    // Assert - Check that selection state is updated
    expect(result.current.selectedSubcategoryId).toBe('2');
  });

  it('should save vocabulary successfully', async () => {
    // Arrange - Setup test data
    const selectedSubcategoryId = '2';
    const mockTableData = [
      { word: 'casa', descriptor: 'house', frequency: 1 },
      { word: 'perro', descriptor: 'dog', frequency: 1 },
    ];

    // Mock the table hook to return test data
    mockUseVocabularyTable.mockReturnValue({
      data: mockTableData,
      saveData:
        createTypedMock<() => Promise<any[]>>().mockResolvedValue(
          mockTableData,
        ),
      // Add other required properties for TableHook
      columns: VOCABULARY_COLUMNS,
      addRow: createTypedMock<() => void>().mockImplementation(() => {}),
      updateCell: createTypedMock<() => void>().mockImplementation(() => {}),
      deleteRow: createTypedMock<() => void>().mockImplementation(() => {}),
      errors: {},
      loading: false,
      pasteData: createTypedMock<() => void>().mockImplementation(() => {}),
    });

    // Mock the vocabulary creation to return successfully
    const createBatchMock = createTypedMock<
      (data: any[]) => Promise<any[]>
    >().mockResolvedValue(
      mockTableData.map((item, index) => ({
        ...item,
        id: index + 1,
      })),
    );

    mockUseVocabulary.mockReturnValue({
      createBatch: createBatchMock,
      creating: false,
      creationError: null,
      // Add other required properties
      vocabulary: [],
      loading: false,
      error: null,
      refetch: createTypedMock<() => void>().mockImplementation(() => {}),
      getById: createTypedMock<() => Promise<any>>().mockResolvedValue(null),
      search: createTypedMock<() => Promise<any[]>>().mockResolvedValue([]),
      createVerb: createTypedMock<() => Promise<any>>().mockResolvedValue({}),
      createNonVerb: createTypedMock<() => Promise<any>>().mockResolvedValue(
        {},
      ),
      deleteVocabulary:
        createTypedMock<() => Promise<void>>().mockResolvedValue(),
      deleting: false,
      deletionError: null,
    });

    // Act - Call the hook, select subcategory and save
    const { result } = renderHook(() => useNonVerbCreation());

    act(() => {
      result.current.setSelectedSubcategoryId(selectedSubcategoryId);
    });

    const saveResult = await result.current.saveVocabulary();

    // Assert - Check that save was successful and correct data was passed
    expect(saveResult).toBe(true);
    expect(createBatchMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          word: 'casa',
          descriptor: 'house',
          subcategoryId: 2, // Converted to number
        }),
        expect.objectContaining({
          word: 'perro',
          descriptor: 'dog',
          subcategoryId: 2, // Converted to number
        }),
      ]),
    );
  });
});
