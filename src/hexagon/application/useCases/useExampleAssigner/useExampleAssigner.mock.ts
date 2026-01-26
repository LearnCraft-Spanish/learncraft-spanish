import type { UseExampleAssignerReturn } from '@application/useCases/useExampleAssigner/useExampleAssigner';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import {
  createMockFlashcard,
  createMockFlashcardList,
} from '@testing/factories/flashcardFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import { vi } from 'vitest';

const defaultMockStudentFlashcards: UseStudentFlashcardsReturn = {
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

const defaultMockLessonPopup: LessonPopup = {
  lessonsByVocabulary: [],
  lessonsLoading: false,
};

const defaultResult: UseExampleAssignerReturn = {
  selectedExamples: createMockExampleWithVocabularyList(3),
  isFetchingSelectedExamples: false,
  assignmentTypeSelectorProps: {
    assignmentType: 'students',
    onToggle: vi.fn(),
  },
  studentSelectionProps: {
    isLoading: false,
  },
  quizSelectionProps: {
    selectedCourseCode: 'none',
    onCourseCodeChange: vi.fn(),
    selectedQuizRecordId: undefined,
    onQuizRecordIdChange: vi.fn(),
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
      previousPage: vi.fn(),
      nextPage: vi.fn(),
      goToFirstPage: vi.fn(),
    },
    isLoading: false,
    error: null,
    targetName: 'Student',
    onGoingToQuiz: vi.fn(),
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
    onClick: vi.fn(),
  },
  assignExamples: vi.fn(async () => Promise.resolve()),
  assigningError: null,
};

export const {
  mock: mockUseExampleAssigner,
  override: overrideMockUseExampleAssigner,
  reset: resetMockUseExampleAssigner,
} = createOverrideableMock<UseExampleAssignerReturn>(defaultResult);

export default mockUseExampleAssigner;
