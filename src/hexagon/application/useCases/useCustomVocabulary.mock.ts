import { setMockResult } from '@testing/utils/setMockResult';
import { createTypedMock } from '@testing/utils/typedMock';

// Mock implementations for all functions returned by the hook
export const mockEnableManualVocabulary = createTypedMock<() => void>();
export const mockDisableManualVocabulary = createTypedMock<() => void>();
export const mockSetUserAddedVocabulary =
  createTypedMock<(value: string) => void>();

// Default state values
let mockAddManualVocabulary = false;
let mockUserAddedVocabulary = '';

// Create the mock hook return value
export const mockUseCustomVocabularyReturnValue = {
  addManualVocabulary: mockAddManualVocabulary,
  enableManualVocabulary: mockEnableManualVocabulary,
  disableManualVocabulary: mockDisableManualVocabulary,
  userAddedVocabulary: mockUserAddedVocabulary,
  setUserAddedVocabulary: mockSetUserAddedVocabulary,
};

// Main mock function
export const mockUseCustomVocabulary = createTypedMock<
  () => typeof mockUseCustomVocabularyReturnValue
>().mockReturnValue(mockUseCustomVocabularyReturnValue);

// Setup function for tests to override mock behavior
export const overrideMockUseCustomVocabulary = (
  config: Partial<{
    addManualVocabulary: boolean;
    userAddedVocabulary: string;
    enableManualVocabulary: jest.Mock;
    disableManualVocabulary: jest.Mock;
    setUserAddedVocabulary: jest.Mock;
  }> = {},
) => {
  // Override state values
  if (config.addManualVocabulary !== undefined) {
    mockAddManualVocabulary = config.addManualVocabulary;
    mockUseCustomVocabularyReturnValue.addManualVocabulary =
      config.addManualVocabulary;
  }

  if (config.userAddedVocabulary !== undefined) {
    mockUserAddedVocabulary = config.userAddedVocabulary;
    mockUseCustomVocabularyReturnValue.userAddedVocabulary =
      config.userAddedVocabulary;
  }

  // Override functions
  setMockResult(mockEnableManualVocabulary, config.enableManualVocabulary);
  setMockResult(mockDisableManualVocabulary, config.disableManualVocabulary);
  setMockResult(mockSetUserAddedVocabulary, config.setUserAddedVocabulary);
};

// Always return a valid hook mock with proper fallbacks
export const callMockUseCustomVocabulary = () => {
  try {
    return mockUseCustomVocabularyReturnValue;
  } catch (error) {
    console.error(
      'Error in useCustomVocabulary mock, returning fallback',
      error,
    );
    // Create a fresh hook mock with defaults if the original mock fails
    return {
      addManualVocabulary: false,
      enableManualVocabulary: jest.fn(),
      disableManualVocabulary: jest.fn(),
      userAddedVocabulary: '',
      setUserAddedVocabulary: jest.fn(),
    };
  }
};

// Default export
export default mockUseCustomVocabulary;
