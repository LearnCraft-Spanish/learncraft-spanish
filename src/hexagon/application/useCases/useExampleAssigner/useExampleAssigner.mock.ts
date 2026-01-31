import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type {
  AssignButtonProps,
  AssignedQuizExamplesProps,
  AssignedStudentFlashcardsProps,
  AssignmentTypeSelectorProps,
  QuizSelectionProps,
  StudentSelectionProps,
  UnassignedExamplesProps,
  UseExampleAssignerReturn,
} from '@application/useCases/useExampleAssigner/useExampleAssigner';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import {
  createMockFlashcard,
  createMockFlashcardList,
} from '@testing/factories/flashcardFactory';
import { vi } from 'vitest';

/** Override config: top-level and nested props are partial; defaults fill the rest. */
export interface UseExampleAssignerOverrideConfig {
  selectedExamples?: UseExampleAssignerReturn['selectedExamples'];
  isFetchingSelectedExamples?: UseExampleAssignerReturn['isFetchingSelectedExamples'];
  assignmentTypeSelectorProps?: Partial<AssignmentTypeSelectorProps>;
  studentSelectionProps?: Partial<StudentSelectionProps>;
  quizSelectionProps?: Partial<QuizSelectionProps>;
  assignedStudentFlashcardsProps?: Partial<AssignedStudentFlashcardsProps>;
  assignedQuizExamplesProps?: Partial<AssignedQuizExamplesProps>;
  unassignedExamplesProps?: Partial<UnassignedExamplesProps>;
  assignButtonProps?: Partial<AssignButtonProps>;
  assignExamples?: UseExampleAssignerReturn['assignExamples'];
  assigningError?: UseExampleAssignerReturn['assigningError'];
}

export const defaultMockStudentFlashcards: UseStudentFlashcardsReturn = {
  flashcards: createMockFlashcardList()(3),
  flashcardsDueForReview: createMockFlashcardList()(2),
  customFlashcards: createMockFlashcardList()(1),
  customFlashcardsDueForReview: createMockFlashcardList()(1),
  audioFlashcards: createMockFlashcardList()(2),
  collectedExamples: createMockExampleWithVocabularyList(3),
  isLoading: false,
  error: null,
  updateFlashcardInterval: async () => Promise.resolve(1),
  getRandomFlashcards: ({ count }) => {
    const mockFlashcards = createMockFlashcardList()(5);
    return mockFlashcards.slice(0, count);
  },
  isFlashcardCollected: () => false,
  isExampleCollected: () => false,
  isAddingFlashcard: () => false,
  isRemovingFlashcard: () => false,
  isCustomFlashcard: () => false,
  isPendingFlashcard: () => false,
  createFlashcards: async (examples) => {
    return Promise.resolve(
      examples.map((example) =>
        createMockFlashcard({ example: { ...example, id: example.id } }),
      ),
    );
  },
  deleteFlashcards: async (exampleIds) => {
    return Promise.resolve(exampleIds.length);
  },
  updateFlashcards: async (updates) => {
    return Promise.resolve(createMockFlashcardList()(updates.length));
  },
  getFlashcardByExampleId: ({ exampleId }: { exampleId: number }) => {
    const flashcard = createMockFlashcard({ id: exampleId });
    return {
      ...flashcard,
      example: { ...flashcard.example, id: exampleId },
    };
  },
};

export const defaultMockLessonPopup: LessonPopup = {
  lessonsByVocabulary: [],
  lessonsLoading: false,
};

const defaultResult: UseExampleAssignerReturn = {
  selectedExamples: createMockExampleWithVocabularyList(3),
  isFetchingSelectedExamples: false,
  assignmentTypeSelectorProps: {
    assignmentType: 'students',
    onToggle: vi.fn<() => void>(),
  },
  studentSelectionProps: {
    isLoading: false,
  },
  quizSelectionProps: {
    selectedCourseCode: 'none',
    onCourseCodeChange: vi.fn<(code: string) => void>(),
    selectedQuizRecordId: undefined,
    onQuizRecordIdChange: vi.fn<(id: number | undefined) => void>(),
    availableQuizzes: undefined,
    courseOptions: [],
  },
  assignedStudentFlashcardsProps: {
    allFlashcards: createMockFlashcardList()(3),
    displayFlashcards: createMockFlashcardList()(3),
    paginationState: {
      totalItems: 3,
      pageNumber: 1,
      maxPageNumber: 1,
      startIndex: 0,
      endIndex: 3,
      pageSize: 50,
      isOnFirstPage: true,
      isOnLastPage: true,
      previousPage: vi.fn<() => void>(),
      nextPage: vi.fn<() => void>(),
      goToFirstPage: vi.fn<() => void>(),
    },
    isLoading: false,
    error: null,
    targetName: 'Student',
    onGoingToQuiz: vi.fn<() => void>(),
  },
  assignedQuizExamplesProps: undefined,
  unassignedExamplesProps: {
    examples: createMockExampleWithVocabularyList(3),
    studentFlashcards: defaultMockStudentFlashcards,
    lessonPopup: defaultMockLessonPopup,
  },
  assignButtonProps: {
    assignmentType: 'students',
    unassignedCount: 3,
    isAssigning: false,
    canAssign: true,
    activeStudentName: 'Test Student',
    quizName: null,
    onClick: vi.fn<() => void>(),
  },
  assignExamples: vi.fn<() => Promise<void>>(async () => Promise.resolve()),
  assigningError: null,
};

// Create function mock following useFrequensay pattern for interface component tests
export const mockUseExampleAssigner = vi
  .fn<() => UseExampleAssignerReturn>()
  .mockReturnValue(defaultResult);

export const overrideMockUseExampleAssigner = (
  config: UseExampleAssignerOverrideConfig = {},
) => {
  // Partial overrides; defaults fill the rest (same pattern as createOverrideableMock / useFrequensay).
  const mockResult: UseExampleAssignerReturn = {
    ...defaultResult,
    ...config,
    assignmentTypeSelectorProps:
      config.assignmentTypeSelectorProps != null
        ? {
            ...defaultResult.assignmentTypeSelectorProps,
            ...config.assignmentTypeSelectorProps,
          }
        : defaultResult.assignmentTypeSelectorProps,
    studentSelectionProps:
      config.studentSelectionProps != null
        ? {
            ...defaultResult.studentSelectionProps,
            ...config.studentSelectionProps,
          }
        : defaultResult.studentSelectionProps,
    quizSelectionProps:
      config.quizSelectionProps != null
        ? { ...defaultResult.quizSelectionProps, ...config.quizSelectionProps }
        : defaultResult.quizSelectionProps,
    unassignedExamplesProps:
      config.unassignedExamplesProps != null
        ? {
            ...defaultResult.unassignedExamplesProps,
            ...config.unassignedExamplesProps,
          }
        : defaultResult.unassignedExamplesProps,
    assignButtonProps:
      config.assignButtonProps != null
        ? { ...defaultResult.assignButtonProps, ...config.assignButtonProps }
        : defaultResult.assignButtonProps,
    assignedStudentFlashcardsProps:
      config.assignedStudentFlashcardsProps != null
        ? {
            ...defaultResult.assignedStudentFlashcardsProps,
            ...config.assignedStudentFlashcardsProps,
          }
        : defaultResult.assignedStudentFlashcardsProps,
    assignedQuizExamplesProps:
      config.assignedQuizExamplesProps !== undefined
        ? {
            ...(defaultResult.assignedQuizExamplesProps ?? {}),
            ...config.assignedQuizExamplesProps,
          }
        : defaultResult.assignedQuizExamplesProps,
  };
  mockUseExampleAssigner.mockReturnValue(mockResult);
  return mockResult;
};

export const resetMockUseExampleAssigner = () => {
  mockUseExampleAssigner.mockReturnValue(defaultResult);
};

export default mockUseExampleAssigner;
