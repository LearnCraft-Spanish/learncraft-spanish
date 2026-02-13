import type { UseQuizExampleMutationsReturn } from '@application/queries/useQuizExampleMutations';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockActiveStudent,
  overrideMockActiveStudent,
  resetMockActiveStudent,
} from '@application/coordinators/hooks/useActiveStudent.mock';
import {
  mockUseAllQuizGroups,
  overrideMockUseAllQuizGroups,
  resetMockUseAllQuizGroups,
} from '@application/queries/useAllQuizGroups.mock';
import {
  mockUseQuizExamples,
  overrideMockUseQuizExamples,
} from '@application/queries/useQuizExamples.mock';
import {
  mockUseStudentFlashcards,
  resetMockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import { useExampleAssigner } from '@application/useCases/useExampleAssigner/useExampleAssigner';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import { createMockQuizGroup } from '@testing/factories/quizFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';
// Mock all dependencies
const mockUseSelectedExamples = vi.fn(() => ({
  selectedExamples: createMockExampleWithVocabularyList(3),
  isFetchingExamples: 0,
}));

const mockUseFlashcardsQuery = vi.fn(() => ({
  flashcards: createMockFlashcardList()(3),
  isLoading: false,
  error: null,
  createFlashcards: vi.fn(async () => Promise.resolve([])),
}));

interface QuizExamplesQueryReturn {
  quizExamples: ExampleWithVocabulary[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const defaultQuizExamplesQueryReturn: QuizExamplesQueryReturn = {
  quizExamples: undefined,
  isLoading: false,
  error: null,
};

const mockUseQuizExamplesQuery = vi.fn(
  (): QuizExamplesQueryReturn => defaultQuizExamplesQueryReturn,
);

const defaultQuizExampleMutationsReturn: UseQuizExampleMutationsReturn = {
  addExamplesToQuiz: vi.fn(async () => Promise.resolve(1)),
  isAddingExamples: false,
  addingExamplesError: null,
};

const mockUseQuizExampleMutations = vi.fn(
  (): UseQuizExampleMutationsReturn => defaultQuizExampleMutationsReturn,
);

const mockUseLessonPopup = vi.fn(() => ({
  lessonPopup: {
    lessonsByVocabulary: [],
    lessonsLoading: false,
  },
}));

const mockUsePagination = vi.fn(() => ({
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
}));

vi.mock(
  '@application/units/ExampleSearchInterface/useSelectedExamples',
  () => ({
    useSelectedExamples: () => mockUseSelectedExamples(),
  }),
);

vi.mock('@application/queries/useFlashcardsQuery', () => ({
  useFlashcardsQuery: () => mockUseFlashcardsQuery(),
}));

vi.mock('@application/queries/useQuizExamplesQuery', () => ({
  useQuizExamplesQuery: () => mockUseQuizExamplesQuery(),
}));

vi.mock('@application/queries/useQuizExampleMutations', () => ({
  useQuizExampleMutations: () => mockUseQuizExampleMutations(),
}));

vi.mock('@application/units/useLessonPopup', () => ({
  default: () => mockUseLessonPopup(),
}));

vi.mock('@application/units/Pagination/usePagination', () => ({
  usePagination: () => mockUsePagination(),
}));

vi.mock('@application/coordinators/hooks/useActiveStudent', () => ({
  useActiveStudent: () => mockActiveStudent,
}));

vi.mock('@application/queries/useAllQuizGroups', () => ({
  useAllQuizGroups: () => mockUseAllQuizGroups,
}));

vi.mock('@application/units/useStudentFlashcards', () => ({
  useStudentFlashcards: () => mockUseStudentFlashcards,
}));

vi.mock('@application/queries/useQuizExamples', () => ({
  useQuizExamples: () => mockUseQuizExamples,
}));

describe('useExampleAssigner', () => {
  beforeEach(() => {
    resetMockActiveStudent();
    resetMockUseAllQuizGroups();
    resetMockUseStudentFlashcards();

    // Reset all mocks to default values
    mockUseSelectedExamples.mockReturnValue({
      selectedExamples: createMockExampleWithVocabularyList(3),
      isFetchingExamples: 0,
    });

    mockUseFlashcardsQuery.mockReturnValue({
      flashcards: createMockFlashcardList()(3),
      isLoading: false,
      error: null,
      createFlashcards: vi.fn(async () => Promise.resolve([])),
    });

    mockUseQuizExamplesQuery.mockReturnValue({
      quizExamples: undefined,
      isLoading: false,
      error: null,
    });

    mockUseQuizExampleMutations.mockReturnValue({
      addExamplesToQuiz: vi.fn(async () => Promise.resolve(1)),
      isAddingExamples: false,
      addingExamplesError: null,
    });

    mockUseLessonPopup.mockReturnValue({
      lessonPopup: {
        lessonsByVocabulary: [],
        lessonsLoading: false,
      },
    });

    mockUsePagination.mockReturnValue({
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
    });
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.selectedExamples).toHaveLength(3);
      expect(result.current.isFetchingSelectedExamples).toBe(false);
      expect(result.current.assignmentTypeSelectorProps.assignmentType).toBe(
        'students',
      );
      expect(result.current.assigningError).toBeNull();
    });

    it('should provide all required props objects', () => {
      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.assignmentTypeSelectorProps).toBeDefined();
      expect(result.current.studentSelectionProps).toBeDefined();
      expect(result.current.quizSelectionProps).toBeDefined();
      expect(result.current.unassignedExamplesProps).toBeDefined();
      expect(result.current.assignButtonProps).toBeDefined();
    });
  });

  describe('assignment type selection', () => {
    it('should toggle assignment type when onToggle is called', async () => {
      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.assignmentTypeSelectorProps.assignmentType).toBe(
        'students',
      );

      await act(async () => {
        result.current.assignmentTypeSelectorProps.onTypeChange('quiz');
      });

      await waitFor(() => {
        expect(result.current.assignmentTypeSelectorProps.assignmentType).toBe(
          'quiz',
        );
      });
    });
  });

  describe('student assignment mode', () => {
    it('should show student flashcards when in student mode', () => {
      const mockAppUser = createMockAppUser({
        recordId: 1,
        name: 'Test Student',
        emailAddress: 'test@example.com',
        studentRole: 'student',
        lessonNumber: 1,
        courseId: 1,
      });

      overrideMockActiveStudent({
        appUser: mockAppUser,
        isLoading: false,
      });

      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.assignedStudentFlashcardsProps).toBeDefined();
      expect(result.current.assignedStudentFlashcardsProps?.targetName).toBe(
        'Test Student',
      );
    });
  });

  describe('quiz assignment mode', () => {
    it('should show quiz examples when quiz is selected', async () => {
      const quizExamples = createMockExampleWithVocabularyList(2);
      const quizzes = [
        {
          id: 1,
          relatedQuizGroupId: 1,
          quizNumber: 1,
          quizTitle: 'Quiz 1',
          published: true,
        },
      ];
      const mockQuizGroups = [
        createMockQuizGroup({
          id: 1,
          name: 'SP101',
          urlSlug: 'SP101',
          courseId: 1,
          quizzes,
        }),
      ];

      overrideMockUseAllQuizGroups({
        quizGroups: mockQuizGroups,
        isLoading: false,
        error: null,
      });
      overrideMockUseQuizExamples({
        data: quizExamples,
        isLoading: false,
        isFetching: false,
        error: null,
      });

      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      // Switch to quiz mode
      act(() => {
        result.current.assignmentTypeSelectorProps.onTypeChange('quiz');
      });

      // Select quiz group and quiz
      act(() => {
        result.current.quizSelectionProps.onQuizGroupIdChange(1);
        result.current.quizSelectionProps.onQuizRecordIdChange(1);
      });

      await waitFor(() => {
        expect(result.current.assignedQuizExamplesProps).toBeDefined();
        expect(result.current.assignedQuizExamplesProps?.examples).toHaveLength(
          2,
        );
      });
    });
  });

  describe('assignment function', () => {
    it('should call createFlashcards for student assignment', async () => {
      const createFlashcardsMock = vi.fn(async () => Promise.resolve([]));

      const mockAppUser = createMockAppUser({
        recordId: 1,
        name: 'Test Student',
        emailAddress: 'test@example.com',
        studentRole: 'student',
        lessonNumber: 1,
        courseId: 1,
      });

      overrideMockActiveStudent({
        appUser: mockAppUser,
        isLoading: false,
      });

      mockUseFlashcardsQuery.mockReturnValue({
        flashcards: [],
        isLoading: false,
        error: null,
        createFlashcards: createFlashcardsMock,
      });

      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      await act(async () => {
        await result.current.assignExamples();
      });

      expect(createFlashcardsMock).toHaveBeenCalledWith(
        result.current.selectedExamples,
      );
    });

    it('should call addExamplesToQuiz for quiz assignment', async () => {
      const addExamplesToQuizMock = vi.fn(async () => Promise.resolve(1));
      const quizzes = [
        {
          id: 1,
          relatedQuizGroupId: 1,
          quizNumber: 1,
          quizTitle: 'Quiz 1',
          published: true,
        },
      ];
      const mockQuizGroups = [
        createMockQuizGroup({
          id: 1,
          name: 'SP101',
          urlSlug: 'SP101',
          courseId: 1,
          quizzes,
        }),
      ];

      overrideMockUseAllQuizGroups({
        quizGroups: mockQuizGroups,
        isLoading: false,
        error: null,
      });

      mockUseQuizExampleMutations.mockReturnValue({
        addExamplesToQuiz: addExamplesToQuizMock,
        isAddingExamples: false,
        addingExamplesError: null,
      });

      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      // Switch to quiz mode and select quiz
      act(() => {
        result.current.assignmentTypeSelectorProps.onTypeChange('quiz');
        result.current.quizSelectionProps.onQuizGroupIdChange(1);
        result.current.quizSelectionProps.onQuizRecordIdChange(1);
      });

      await waitFor(() => {
        expect(result.current.quizSelectionProps.selectedQuizRecordId).toBe(1);
      });

      await act(async () => {
        await result.current.assignExamples();
      });

      expect(addExamplesToQuizMock).toHaveBeenCalledWith({
        quizNumber: 1,
        courseCode: 'SP101',
        exampleIds: result.current.selectedExamples.map((ex) => ex.id),
      });
    });
  });

  describe('error handling', () => {
    it('should expose error from quiz mutations', () => {
      const error = new Error('Failed to assign examples');

      mockUseQuizExampleMutations.mockReturnValue({
        addExamplesToQuiz: vi.fn(async () => Promise.resolve(1)),
        isAddingExamples: false,
        addingExamplesError: error,
      });

      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.assigningError).toBe(error);
    });
  });
});
