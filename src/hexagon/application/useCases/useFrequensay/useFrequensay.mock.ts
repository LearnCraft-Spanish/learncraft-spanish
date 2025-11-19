import type { UseFrequensayResult } from '@application/useCases/useFrequensay/useFrequensay.types';
import { vi } from 'vitest';

export const defaultResult: UseFrequensayResult = {
  spellingsDataError: null,
  spellingsDataLoading: false,
  spellingsData: [],
  FrequensaySetupProps: {
    isFrequensayEnabled: false,
    setIsFrequensayEnabled: vi.fn<() => void>(),
  },
  CustomVocabularyProps: {
    userAddedVocabulary: '',
    setUserAddedVocabulary: vi.fn<() => void>(),
    addManualVocabulary: false,
    disableManualVocabulary: vi.fn<() => void>(),
    enableManualVocabulary: vi.fn<() => void>(),
  },
  TextToCheckProps: {
    userInput: '',
    updateUserInput: vi.fn<() => void>(),
    passageLength: 0,
    comprehensionPercentage: 0,
  },
  UnknownWordsProps: {
    unknownWordCount: [],
    copyUnknownWordsTable: vi.fn<() => void>(),
  },
};

export const mockUseFrequensay = vi
  .fn<() => UseFrequensayResult>()
  .mockReturnValue(defaultResult);

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
