// Simplest possible mock for useSelectedLesson
// Only includes the bare minimum that useFrequensay needs

import { setMockResult } from '@testing/utils/setMockResult';
import { createTypedMock } from '@testing/utils/typedMock';
import { vi } from 'vitest';

// Create mock implementations for each function
export const mockSetProgram =
  createTypedMock<(program: number | string | null) => void>();
export const mockSetFromLesson =
  createTypedMock<(lesson: number | string | null) => void>();
export const mockSetToLesson =
  createTypedMock<(lesson: number | string | null) => void>();
export const mockFilterExamplesBySelectedLesson = createTypedMock<
  (examples: any[]) => any[]
>().mockImplementation((examples) => examples);

// Default state values
const mockSelectedProgram = { name: '' };
const mockSelectedFromLesson = { lessonNumber: 0 };
const mockSelectedToLesson = { lessonNumber: 0 };
let mockAllowedVocabulary: string[] = [];
let mockRequiredVocabulary: string[] = [];

// Create the mock hook return value
export const mockUseSelectedLessonReturnValue = {
  selectedProgram: mockSelectedProgram,
  selectedFromLesson: mockSelectedFromLesson,
  selectedToLesson: mockSelectedToLesson,
  allowedVocabulary: mockAllowedVocabulary,
  requiredVocabulary: mockRequiredVocabulary,
  setProgram: mockSetProgram,
  setFromLesson: mockSetFromLesson,
  setToLesson: mockSetToLesson,
  filterExamplesBySelectedLesson: mockFilterExamplesBySelectedLesson,
};

// Main mock function
export const mockUseSelectedLesson = createTypedMock<
  () => typeof mockUseSelectedLessonReturnValue
>().mockReturnValue(mockUseSelectedLessonReturnValue);

// Setup function for tests to override mock behavior
export const overrideMockUseSelectedLesson = (
  config: Partial<{
    programName: string;
    fromLessonNumber: number;
    toLessonNumber: number;
    allowedVocabulary: string[];
    requiredVocabulary: string[];
    setProgram: ReturnType<typeof vi.fn>;
    setFromLesson: ReturnType<typeof vi.fn>;
    setToLesson: ReturnType<typeof vi.fn>;
    filterExamplesBySelectedLesson: ReturnType<typeof vi.fn>;
  }> = {},
) => {
  // Override state values
  if (config.programName !== undefined) {
    mockSelectedProgram.name = config.programName;
    mockUseSelectedLessonReturnValue.selectedProgram = mockSelectedProgram;
  }

  if (config.fromLessonNumber !== undefined) {
    mockSelectedFromLesson.lessonNumber = config.fromLessonNumber;
    mockUseSelectedLessonReturnValue.selectedFromLesson =
      mockSelectedFromLesson;
  }

  if (config.toLessonNumber !== undefined) {
    mockSelectedToLesson.lessonNumber = config.toLessonNumber;
    mockUseSelectedLessonReturnValue.selectedToLesson = mockSelectedToLesson;
  }

  if (config.allowedVocabulary !== undefined) {
    mockAllowedVocabulary = config.allowedVocabulary;
    mockUseSelectedLessonReturnValue.allowedVocabulary = mockAllowedVocabulary;
  }

  if (config.requiredVocabulary !== undefined) {
    mockRequiredVocabulary = config.requiredVocabulary;
    mockUseSelectedLessonReturnValue.requiredVocabulary =
      mockRequiredVocabulary;
  }

  // Override functions
  setMockResult(mockSetProgram, config.setProgram);
  setMockResult(mockSetFromLesson, config.setFromLesson);
  setMockResult(mockSetToLesson, config.setToLesson);
  setMockResult(
    mockFilterExamplesBySelectedLesson,
    config.filterExamplesBySelectedLesson,
  );
};

// Always return a valid hook mock with proper fallbacks
export const callMockUseSelectedLesson = () => {
  try {
    return mockUseSelectedLessonReturnValue;
  } catch (error) {
    console.error('Error in useSelectedLesson mock, returning fallback', error);
    // Create a fresh hook mock with defaults if the original mock fails
    return {
      selectedProgram: { name: '' },
      selectedFromLesson: { lessonNumber: 0 },
      selectedToLesson: { lessonNumber: 0 },
      allowedVocabulary: [],
      requiredVocabulary: [],
      setProgram: vi.fn(),
      setFromLesson: vi.fn(),
      setToLesson: vi.fn(),
      filterExamplesBySelectedLesson: vi
        .fn()
        .mockImplementation((examples) => examples),
    };
  }
};

// Default export
export default callMockUseSelectedLesson;
