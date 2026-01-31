import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockActiveStudent,
  overrideMockActiveStudent,
  resetMockActiveStudent,
} from '@application/coordinators/hooks/useActiveStudent.mock';
import {
  mockUseOfficialQuizzesQuery,
  overrideMockUseOfficialQuizzesQuery,
  resetMockUseOfficialQuizzesQuery,
} from '@application/queries/useOfficialQuizzesQuery.mock';
import {
  mockUseStudentFlashcards,
  resetMockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import { useExampleAssigner } from '@application/useCases/useExampleAssigner/useExampleAssigner';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
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

const mockUseQuizExamplesQuery = vi.fn(() => ({
  quizExamples: undefined,
  isLoading: false,
  error: null,
}));

const mockUseQuizExampleMutations = vi.fn(() => ({
  addExamplesToQuiz: vi.fn(async () => Promise.resolve(1)),
  isAddingExamples: false,
  addingExamplesError: null,
}));

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

vi.mock('@application/queries/useOfficialQuizzesQuery', () => ({
  useOfficialQuizzesQuery: () => mockUseOfficialQuizzesQuery,
}));

vi.mock('@application/units/useStudentFlashcards', () => ({
  useStudentFlashcards: () => mockUseStudentFlashcards,
}));

describe('useExampleAssigner', () => {
  beforeEach(() => {
    resetMockActiveStudent();
    resetMockUseOfficialQuizzesQuery();
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
        result.current.assignmentTypeSelectorProps.onToggle();
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
    it('should show quiz examples when quiz is selected', () => {
      const quizExamples = createMockExampleWithVocabularyList(2);
      const officialQuizzes = [
        {
          id: 1,
          courseCode: 'SP101',
          quizNumber: 1,
          quizTitle: 'Quiz 1',
        },
      ];

      overrideMockUseOfficialQuizzesQuery({
        officialQuizRecords: officialQuizzes,
        isLoading: false,
      });

      // Mock returns data which can be undefined, so we need to cast
      mockUseQuizExamplesQuery.mockReturnValue({
        quizExamples: quizExamples as ExampleWithVocabulary[] | undefined,
        isLoading: false,
        error: null,
      } as ReturnType<typeof mockUseQuizExamplesQuery>);

      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      // Switch to quiz mode
      act(() => {
        result.current.assignmentTypeSelectorProps.onToggle();
      });

      // Select course and quiz
      act(() => {
        result.current.quizSelectionProps.onCourseCodeChange('SP101');
        result.current.quizSelectionProps.onQuizRecordIdChange(1);
      });

      waitFor(() => {
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
      const officialQuizzes = [
        {
          id: 1,
          courseCode: 'SP101',
          quizNumber: 1,
          quizTitle: 'Quiz 1',
        },
      ];

      overrideMockUseOfficialQuizzesQuery({
        officialQuizRecords: officialQuizzes,
        isLoading: false,
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
        result.current.assignmentTypeSelectorProps.onToggle();
        result.current.quizSelectionProps.onCourseCodeChange('SP101');
        result.current.quizSelectionProps.onQuizRecordIdChange(1);
      });

      await waitFor(() => {
        expect(result.current.quizSelectionProps.selectedQuizRecordId).toBe(1);
      });

      await act(async () => {
        await result.current.assignExamples();
      });

      expect(addExamplesToQuizMock).toHaveBeenCalledWith({
        courseCode: 'SP101',
        quizNumber: 1,
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
        addingExamplesError: error as Error | null,
      } as ReturnType<typeof mockUseQuizExampleMutations>);

      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.assigningError).toBe(error);
    });
  });
});
