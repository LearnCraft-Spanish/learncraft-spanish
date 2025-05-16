import type { UseCustomVocabularyResult } from './useCustomVocabulary';
import { createTypedMock } from '@testing/utils/typedMock';

// Create the mock hook return value
export const mockUseCustomVocabularyReturnValue: UseCustomVocabularyResult = {
  addManualVocabulary: false,
  enableManualVocabulary: createTypedMock<() => void>(),
  disableManualVocabulary: createTypedMock<() => void>(),
  userAddedVocabulary: 'mockUserAddedVocabulary',
  setUserAddedVocabulary: createTypedMock<() => void>(),
};

// Main mock function
export const mockUseCustomVocabulary = createTypedMock<
  () => UseCustomVocabularyResult
>().mockReturnValue(mockUseCustomVocabularyReturnValue);

// Setup function for tests to override mock behavior
export const overrideMockUseCustomVocabulary = (
  config: Partial<UseCustomVocabularyResult> = {},
) => {
  const mockResult = {
    ...mockUseCustomVocabularyReturnValue,
    ...config,
  };

  mockUseCustomVocabulary.mockReturnValue(mockResult);
  return mockResult;
};

// Always return a valid hook mock with proper fallbacks
export const callMockUseCustomVocabulary = () => {
  try {
    return mockUseCustomVocabulary();
  } catch (error) {
    console.error(
      'Error in useCustomVocabulary mock, returning fallback',
      error,
    );
    // Create a fresh hook mock with defaults if the original mock fails
    return mockUseCustomVocabularyReturnValue;
  }
};

// Default export
export default mockUseCustomVocabulary;
