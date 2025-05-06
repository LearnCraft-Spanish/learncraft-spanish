import { vi } from 'vitest';
import { UseFrequensayResult } from './useFrequensay';

export const defaultResult: UseFrequensayResult = {
  isSuccess: true,
  isError: false,
  error: null,
  isLoading: false,
  data: [],
  CustomVocabularyProps: {
    userAddedVocabulary: '',
    setUserAddedVocabulary: vi.fn(),
    addManualVocabulary: false,
    disableManualVocabulary: vi.fn(),
    enableManualVocabulary: vi.fn(),
  },
  TextToCheckProps: {
    userInput: '',
    updateUserInput: vi.fn(),
    passageLength: 0,
    comprehensionPercentage: 0,
  },
  UnknownWordsProps: {
    unknownWordCount: [],
    copyUnknownWordsTable: vi.fn(),
  },
};

export const mockUseFrequensay = vi.fn().mockReturnValue(defaultResult);

export const overrideMockUseFrequensay = (
  config: Partial<UseFrequensayResult> = {},
) => {
  const mockResult = {
    ...defaultResult,
    ...config,
  };

  mockUseFrequensay.mockReturnValue(mockResult);
  return mockResult;
};

export const callMockUseFrequensay = () => mockUseFrequensay();

export default mockUseFrequensay;
