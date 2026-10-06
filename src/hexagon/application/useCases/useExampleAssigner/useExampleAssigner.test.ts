import type { UseFlashcardsQueryReturnType } from '@application/queries/useFlashcardsQuery';
import type { UseQuizExampleMutationsReturn } from '@application/queries/useQuizExampleMutations';
import type { UseExampleAssignerReturn } from '@application/useCases/useExampleAssigner/useExampleAssigner';
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
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
  resetMockUseQuizExamples,
} from '@application/queries/useQuizExamples.mock';
import {
  mockUseLessonPopup,
  resetMockUseLessonPopup,
} from '@application/units/useLessonPopup.mock';
import {
  mockUseStudentFlashcards,
  resetMockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import { useExampleAssigner } from '@application/useCases/useExampleAssigner/useExampleAssigner';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import {
  createMockFlashcard,
  createMockFlashcardList,
} from '@testing/factories/flashcardFactory';
import { createMockQuizGroup } from '@testing/factories/quizFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const toastPromise = vi.fn();
const quizExampleCalls: Array<{
  quizId: number;
  vocabularyComplete?: boolean;
}> = [];

const {
  mock: selectedExamplesState,
  override: overrideSelectedExamples,
  reset: resetSelectedExamples,
} = createOverrideableMock({
  selectedExamples: createMockExampleWithVocabularyList(3),
  isFetchingExamples: 0,
});

const {
  mock: flashcardsQuery,
  override: overrideFlashcardsQuery,
  reset: resetFlashcardsQuery,
} = createOverrideableMock<UseFlashcardsQueryReturnType>({
  flashcards: createMockFlashcardList()(3),
  isLoading: false,
  error: null,
  pendingDeleteExampleIds: undefined,
  createFlashcards: async () => [],
  deleteFlashcards: async () => 0,
  updateFlashcards: async () => [],
  isFetchingFlashcards: false,
});

const {
  mock: quizMutations,
  override: overrideQuizMutations,
  reset: resetQuizMutations,
} = createOverrideableMock<UseQuizExampleMutationsReturn>({
  addExamplesToQuiz: async () => 1,
  isAddingExamples: false,
  addingExamplesError: null,
});

vi.mock('react-toastify', () => ({
  toast: {
    promise: (...args: unknown[]) => toastPromise(...args),
  },
}));

vi.mock(
  '@application/units/ExampleSearchInterface/useSelectedExamples',
  () => ({
    useSelectedExamples: () => selectedExamplesState,
  }),
);

vi.mock('@application/queries/useFlashcardsQuery', () => ({
  useFlashcardsQuery: () => flashcardsQuery,
}));

vi.mock('@application/queries/useQuizExampleMutations', () => ({
  useQuizExampleMutations: () => quizMutations,
}));

vi.mock('@application/units/useLessonPopup', () => ({
  default: () => mockUseLessonPopup(),
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
  useQuizExamples: (args: { quizId: number; vocabularyComplete?: boolean }) => {
    quizExampleCalls.push(args);
    return mockUseQuizExamples;
  },
}));

describe('useExampleAssigner', () => {
  beforeEach(() => {
    quizExampleCalls.length = 0;
    resetMockActiveStudent();
    resetMockUseAllQuizGroups();
    resetMockUseStudentFlashcards();
    resetMockUseQuizExamples();
    resetMockUseLessonPopup();
    resetSelectedExamples();
    resetFlashcardsQuery();
    resetQuizMutations();
    overrideSelectedExamples({
      selectedExamples: createMockExampleWithVocabularyList(3),
      isFetchingExamples: 0,
    });
    overrideFlashcardsQuery({
      flashcards: createMockFlashcardList()(3),
      isLoading: false,
      isFetchingFlashcards: false,
      error: null,
      createFlashcards: async () => [],
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

      overrideFlashcardsQuery({
        flashcards: [],
        isLoading: false,
        isFetchingFlashcards: false,
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
        result.current.unassignedExamplesProps.examples,
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

      overrideQuizMutations({
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
        quizId: 1,
        quizNumber: 1,
        courseCode: 'SP101',
        exampleIds: result.current.unassignedExamplesProps.examples.map(
          (ex) => ex.id,
        ),
      });
    });

    it('should only send unassigned examples to quiz when some are already assigned', async () => {
      // Assign explicit sequential IDs so the filter is deterministic regardless
      // of the time-based factory seed (same-millisecond calls produce identical IDs).
      const allSelectedExamples = createMockExampleWithVocabularyList(4).map(
        (ex, i) => ({ ...ex, id: i + 1 }),
      );
      const alreadyAssignedExamples = allSelectedExamples.slice(0, 2);
      const unassignedExamples = allSelectedExamples.slice(2);

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

      overrideSelectedExamples({
        selectedExamples: allSelectedExamples,
        isFetchingExamples: 0,
      });

      overrideMockUseAllQuizGroups({
        quizGroups: mockQuizGroups,
        isLoading: false,
        error: null,
      });

      overrideMockUseQuizExamples({
        data: alreadyAssignedExamples,
        isLoading: false,
        isFetching: false,
        error: null,
      });

      overrideQuizMutations({
        addExamplesToQuiz: addExamplesToQuizMock,
        isAddingExamples: false,
        addingExamplesError: null,
      });

      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

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
        quizId: 1,
        quizNumber: 1,
        courseCode: 'SP101',
        exampleIds: unassignedExamples.map((ex) => ex.id),
      });

      expect(addExamplesToQuizMock).not.toHaveBeenCalledWith(
        expect.objectContaining({
          exampleIds: expect.arrayContaining(
            alreadyAssignedExamples.map((ex) => ex.id),
          ),
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should expose error from quiz mutations', () => {
      const error = new Error('Failed to assign examples');

      overrideQuizMutations({
        addExamplesToQuiz: async () => 1,
        isAddingExamples: false,
        addingExamplesError: error,
      });

      const { result } = renderHook(() => useExampleAssigner(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.assigningError).toBe(error);
    });
  });

  describe('student and quiz assignment stay distinct', () => {
    const quizzes = [buildQuiz(10, 3, 'Animals', 7), buildQuiz(11, 4, '', 7)];
    const otherQuizzes = [buildQuiz(20, 8, 'Other group', 8)];

    function installGroups() {
      overrideMockUseAllQuizGroups({
        quizGroups: [
          buildGroup(7, 'Group Name', 'sp-1', quizzes),
          buildGroup(8, 'Other', 'other', otherQuizzes),
        ],
        isLoading: false,
        error: null,
      });
    }

    it('assigns selected examples to the student and not to a quiz', async () => {
      const examples = numberedExamples(2);
      const createFlashcards = vi.fn(async () => []);
      overrideSelectedExamples({
        selectedExamples: examples,
        isFetchingExamples: 0,
      });
      overrideMockActiveStudent({
        appUser: createMockAppUser({ recordId: 5, name: 'Ada' }),
        isLoading: false,
      });
      overrideFlashcardsQuery({
        flashcards: [],
        isLoading: false,
        isFetchingFlashcards: false,
        error: null,
        createFlashcards,
      });
      installGroups();
      const { result } = renderAssigner();
      selectQuiz(result, 7, 10);
      act(() => {
        result.current.assignmentTypeSelectorProps.onTypeChange('students');
      });

      expect(result.current.assignmentTypeSelectorProps.assignmentType).toBe(
        'students',
      );
      expect(result.current.quizSelectionProps.selectedQuizGroupId).toBe(
        undefined,
      );
      expect(result.current.quizSelectionProps.selectedQuizRecordId).toBe(
        undefined,
      );
      expect(result.current.assignedStudentFlashcardsProps).toBeDefined();
      expect(result.current.assignedQuizExamplesProps).toBeUndefined();
      expect(result.current.assignButtonProps.canAssign).toBe(true);
      expect(result.current.assignButtonProps.quizName).toBeNull();
      expect(quizExampleCalls.at(-1)).toEqual({
        quizId: 0,
        vocabularyComplete: undefined,
      });

      await act(async () => {
        await result.current.assignExamples();
      });

      expect(createFlashcards).toHaveBeenCalledWith(examples);
      expect(quizMutations.addExamplesToQuiz).not.toHaveBeenCalled();
      expect(toastPromise).toHaveBeenCalledWith(expect.any(Promise), {
        pending: 'Assigning flashcards...',
        success: 'Flashcards assigned',
        error: 'Failed to assign flashcards',
      });
    });

    it('assigns only the unassigned examples to the selected quiz', async () => {
      const examples = numberedExamples(3);
      const addExamplesToQuiz = vi.fn(async () => 1);
      overrideSelectedExamples({
        selectedExamples: examples,
        isFetchingExamples: 0,
      });
      overrideMockActiveStudent({ appUser: null, isLoading: false });
      overrideMockUseQuizExamples({
        data: [examples[1]],
        isLoading: false,
        isFetching: false,
        error: null,
      });
      overrideQuizMutations({
        addExamplesToQuiz,
        isAddingExamples: false,
        addingExamplesError: null,
      });
      installGroups();
      const { result } = renderAssigner();
      selectQuiz(result, 7, 10);

      expect(result.current.assignedStudentFlashcardsProps).toBeUndefined();
      expect(result.current.assignedQuizExamplesProps?.examples).toEqual([
        examples[1],
      ]);
      expect(result.current.assignedQuizExamplesProps?.targetName).toBe(
        'Animals',
      );
      expect(result.current.assignButtonProps.quizName).toBe('Animals');
      expect(result.current.assignButtonProps.canAssign).toBe(true);
      expect(
        result.current.unassignedExamplesProps.examples.map(
          (example) => example.id,
        ),
      ).toEqual([1, 3]);
      expect(quizExampleCalls.at(-1)).toEqual({
        quizId: 10,
        vocabularyComplete: undefined,
      });

      await act(async () => {
        await result.current.assignExamples();
      });

      expect(addExamplesToQuiz).toHaveBeenCalledWith({
        quizId: 10,
        quizNumber: 3,
        courseCode: 'sp-1',
        exampleIds: [1, 3],
      });
      expect(flashcardsQuery.createFlashcards).not.toHaveBeenCalled();
      expect(toastPromise).toHaveBeenCalledWith(expect.any(Promise), {
        pending: 'Adding examples to quiz...',
        success: 'Examples added to quiz',
        error: 'Failed to add examples to quiz',
      });
    });

    it('filters student flashcards in student mode and ignores quiz examples', () => {
      const examples = numberedExamples(3);
      overrideSelectedExamples({
        selectedExamples: examples,
        isFetchingExamples: 0,
      });
      overrideMockActiveStudent({
        appUser: createMockAppUser({ recordId: 5, name: 'Ada' }),
        isLoading: false,
      });
      const owned = flashcardsFor([examples[0]]);
      overrideFlashcardsQuery({
        flashcards: owned,
        isLoading: false,
        isFetchingFlashcards: false,
        error: null,
      });
      overrideMockUseQuizExamples({
        data: [examples[1]],
        isLoading: false,
        isFetching: false,
        error: null,
      });

      const { result } = renderAssigner();

      expect(
        result.current.unassignedExamplesProps.examples.map(
          (example) => example.id,
        ),
      ).toEqual([2, 3]);
      expect(result.current.unassignedExamplesProps.studentFlashcards).toBe(
        owned,
      );
      expect(
        result.current.unassignedExamplesProps.totalSelectedExamplesCount,
      ).toBe(3);
      expect(result.current.assignButtonProps.unassignedCount).toBe(2);
    });

    it('keeps every selected example when that mode has no assigned rows yet', () => {
      const examples = numberedExamples(2);
      overrideSelectedExamples({
        selectedExamples: examples,
        isFetchingExamples: 0,
      });
      overrideFlashcardsQuery({
        flashcards: undefined,
        isLoading: false,
        isFetchingFlashcards: false,
        error: null,
      });
      const student = renderAssigner();
      expect(student.result.current.assignedStudentFlashcardsProps).toBe(
        undefined,
      );
      expect(student.result.current.unassignedExamplesProps.examples).toEqual(
        examples,
      );
      expect(
        student.result.current.unassignedExamplesProps.studentFlashcards,
      ).toEqual([]);
      student.unmount();

      overrideMockUseQuizExamples({
        data: undefined,
        isLoading: false,
        isFetching: false,
        error: null,
      });
      installGroups();
      const quiz = renderAssigner();
      selectQuiz(quiz.result, 7, 10);
      expect(quiz.result.current.assignedQuizExamplesProps).toBeUndefined();
      expect(quiz.result.current.unassignedExamplesProps.examples).toEqual(
        examples,
      );
    });
  });

  describe('quiz group and quiz record selection', () => {
    const quizzes = [buildQuiz(10, 3, 'Animals', 7), buildQuiz(11, 0, '', 7)];

    function installGroups(
      groups = [buildGroup(7, 'Group Name', 'sp-1', quizzes)],
    ) {
      overrideMockUseAllQuizGroups({
        quizGroups: groups,
        isLoading: false,
        error: null,
      });
    }

    it('lists group names and the quizzes that belong to the selected group', () => {
      installGroups([
        buildGroup(7, 'Alpha', 'alpha', quizzes),
        buildGroup(8, 'Beta', 'beta', [buildQuiz(20, 1, 'Beta quiz', 8)]),
      ]);
      const { result } = renderAssigner();

      expect(result.current.quizSelectionProps.quizGroupOptions).toEqual([
        { id: 7, name: 'Alpha' },
        { id: 8, name: 'Beta' },
      ]);
      expect(result.current.quizSelectionProps.availableQuizzes).toBe(
        undefined,
      );

      act(() => {
        result.current.quizSelectionProps.onQuizGroupIdChange(8);
      });

      expect(result.current.quizSelectionProps.availableQuizzes).toEqual([
        buildQuiz(20, 1, 'Beta quiz', 8),
      ]);
    });

    it('returns an empty quiz list when the selected group is missing', async () => {
      installGroups();
      overrideMockUseQuizExamples({
        data: [],
        isLoading: false,
        isFetching: false,
        error: null,
      });
      overrideMockActiveStudent({
        appUser: createMockAppUser({ recordId: 5, name: 'Ada' }),
        isLoading: false,
      });
      const { result } = renderAssigner();
      selectQuiz(result, 99, 10);

      expect(result.current.quizSelectionProps.availableQuizzes).toEqual([]);
      expect(result.current.assignButtonProps.quizName).toBeNull();
      expect(result.current.assignButtonProps.canAssign).toBe(false);
      expect(result.current.assignedQuizExamplesProps?.targetName).toBe('Quiz');
      expect(quizExampleCalls.at(-1)?.quizId).toBe(0);

      await expect(result.current.assignExamples()).rejects.toThrow(
        'No quiz selected',
      );
      expect(quizMutations.addExamplesToQuiz).not.toHaveBeenCalled();
    });

    it('returns no quiz list when quiz groups have not loaded', () => {
      overrideMockUseAllQuizGroups({
        quizGroups: undefined,
        isLoading: false,
        error: null,
      });
      const { result } = renderAssigner();
      act(() => {
        result.current.quizSelectionProps.onQuizGroupIdChange(7);
      });

      expect(result.current.quizSelectionProps.availableQuizzes).toBe(
        undefined,
      );
      expect(result.current.quizSelectionProps.quizGroupOptions).toEqual([]);
    });

    it('ignores a quiz id that is not in the selected group', async () => {
      installGroups([
        buildGroup(7, 'Alpha', 'alpha', quizzes),
        buildGroup(8, 'Beta', '', [buildQuiz(20, 9, 'Beta quiz', 8)]),
      ]);
      const { result } = renderAssigner();
      selectQuiz(result, 7, 20);

      expect(
        result.current.quizSelectionProps.availableQuizzes?.map(
          (quiz) => quiz.id,
        ),
      ).toEqual([10, 11]);
      expect(result.current.quizSelectionProps.selectedQuizRecordId).toBe(20);
      expect(result.current.assignButtonProps.canAssign).toBe(false);
      expect(result.current.assignButtonProps.quizName).toBeNull();
      expect(quizExampleCalls.at(-1)?.quizId).toBe(0);

      await expect(result.current.assignExamples()).rejects.toThrow(
        'No quiz selected',
      );
      expect(quizMutations.addExamplesToQuiz).not.toHaveBeenCalled();
    });

    it('uses the quiz number when the selected quiz has no title', () => {
      installGroups([
        buildGroup(7, 'Alpha', 'alpha', [
          buildQuiz(10, 4, '', 7),
          buildQuiz(11, 0, '', 7),
        ]),
      ]);
      overrideMockUseQuizExamples({
        data: [],
        isLoading: false,
        isFetching: false,
        error: null,
      });
      const numbered = renderAssigner();
      selectQuiz(numbered.result, 7, 10);
      expect(numbered.result.current.assignButtonProps.quizName).toBe('Quiz 4');
      expect(
        numbered.result.current.assignedQuizExamplesProps?.targetName,
      ).toBe('Quiz 4');
      numbered.unmount();

      const unnamed = renderAssigner();
      selectQuiz(unnamed.result, 7, 11);
      expect(unnamed.result.current.assignButtonProps.quizName).toBeNull();
      expect(unnamed.result.current.assignedQuizExamplesProps?.targetName).toBe(
        'Quiz',
      );
    });

    it('sends an empty course code when the group slug is empty', async () => {
      const addExamplesToQuiz = vi.fn(async () => 1);
      installGroups([
        buildGroup(7, 'Alpha', '', [buildQuiz(10, 3, 'Animals', 7)]),
      ]);
      overrideQuizMutations({ addExamplesToQuiz });
      overrideFlashcardsQuery({ flashcards: [] });
      const { result } = renderAssigner();
      selectQuiz(result, 7, 10);

      await act(async () => {
        await result.current.assignExamples();
      });

      expect(addExamplesToQuiz).toHaveBeenCalledWith(
        expect.objectContaining({ courseCode: '', quizId: 10, quizNumber: 3 }),
      );
    });

    it('does not select a quiz record while assignment is still for a student', () => {
      installGroups();
      const { result } = renderAssigner();
      act(() => {
        result.current.quizSelectionProps.onQuizGroupIdChange(7);
        result.current.quizSelectionProps.onQuizRecordIdChange(10);
      });

      expect(result.current.assignmentTypeSelectorProps.assignmentType).toBe(
        'students',
      );
      expect(result.current.assignButtonProps.quizName).toBeNull();
      expect(quizExampleCalls.at(-1)).toEqual({
        quizId: 0,
        vocabularyComplete: undefined,
      });

      act(() => {
        result.current.assignmentTypeSelectorProps.onTypeChange('students');
      });
      expect(result.current.quizSelectionProps.selectedQuizGroupId).toBe(
        undefined,
      );
      expect(result.current.quizSelectionProps.selectedQuizRecordId).toBe(
        undefined,
      );
      expect(result.current.quizSelectionProps.availableQuizzes).toBe(
        undefined,
      );
    });
  });

  describe('assignment guards and display names', () => {
    function readyStudent(examples = numberedExamples(1)) {
      overrideSelectedExamples({
        selectedExamples: examples,
        isFetchingExamples: 0,
      });
      overrideMockActiveStudent({
        appUser: createMockAppUser({ recordId: 5, name: 'Ada' }),
        isLoading: false,
      });
      overrideFlashcardsQuery({
        flashcards: [],
        isLoading: false,
        isFetchingFlashcards: false,
        error: null,
      });
      overrideMockUseAllQuizGroups({
        quizGroups: [],
        isLoading: false,
        error: null,
      });
      overrideMockUseQuizExamples({
        data: undefined,
        isLoading: false,
        isFetching: false,
        error: null,
      });
      overrideQuizMutations({ isAddingExamples: false });
      return examples;
    }

    it('names the active student and reports when selected examples are loading', () => {
      readyStudent();
      overrideSelectedExamples({
        selectedExamples: numberedExamples(1),
        isFetchingExamples: 1,
      });
      const loading = renderAssigner();
      expect(loading.result.current.isFetchingSelectedExamples).toBe(true);
      expect(
        loading.result.current.assignedStudentFlashcardsProps?.targetName,
      ).toBe('Ada');
      expect(loading.result.current.assignButtonProps.activeStudentName).toBe(
        'Ada',
      );
      loading.unmount();

      overrideMockActiveStudent({
        appUser: createMockAppUser({ recordId: 5, name: '' }),
        isLoading: false,
      });
      const unnamed = renderAssigner();
      expect(
        unnamed.result.current.assignedStudentFlashcardsProps?.targetName,
      ).toBe('Student');

      overrideMockActiveStudent({ appUser: null, isLoading: true });
      const missing = renderAssigner();
      expect(
        missing.result.current.assignedStudentFlashcardsProps?.targetName,
      ).toBe('Student');
      expect(missing.result.current.studentSelectionProps.isLoading).toBe(true);
    });

    it('can assign to a student only when a student is active and rows remain', async () => {
      const examples = readyStudent();
      const ready = renderAssigner();
      expect(ready.result.current.assignButtonProps.canAssign).toBe(true);
      ready.unmount();

      overrideMockActiveStudent({ appUser: null, isLoading: false });
      const noStudent = renderAssigner();
      expect(noStudent.result.current.assignButtonProps.canAssign).toBe(false);
      await expect(noStudent.result.current.assignExamples()).rejects.toThrow(
        'No active student selected',
      );
      noStudent.unmount();

      overrideMockActiveStudent({
        appUser: {
          ...createMockAppUser({ name: 'Ada' }),
          recordId: undefined,
        } as unknown as ReturnType<typeof createMockAppUser>,
        isLoading: false,
      });
      const noRecord = renderAssigner();
      expect(noRecord.result.current.assignButtonProps.canAssign).toBe(true);
      await expect(noRecord.result.current.assignExamples()).rejects.toThrow(
        'No active student selected',
      );
      noRecord.unmount();

      readyStudent(examples);
      overrideFlashcardsQuery({
        flashcards: flashcardsFor(examples),
        isLoading: false,
        isFetchingFlashcards: false,
        error: null,
      });
      const allOwned = renderAssigner();
      expect(allOwned.result.current.assignButtonProps.canAssign).toBe(false);
      expect(allOwned.result.current.unassignedExamplesProps.examples).toEqual(
        [],
      );
      await expect(allOwned.result.current.assignExamples()).rejects.toThrow(
        'No unassigned examples to add',
      );
    });

    it('blocks assignment while student or quiz data is still loading', () => {
      readyStudent();
      const cases: Array<() => void> = [
        () => overrideFlashcardsQuery({ isLoading: true }),
        () => overrideFlashcardsQuery({ isFetchingFlashcards: true }),
        () => overrideMockUseQuizExamples({ isLoading: true }),
        () => overrideMockUseQuizExamples({ isFetching: true }),
        () => overrideMockUseAllQuizGroups({ isLoading: true }),
        () => overrideQuizMutations({ isAddingExamples: true }),
        () => overrideSelectedExamples({ selectedExamples: [] }),
      ];

      cases.forEach((apply) => {
        readyStudent();
        apply();
        const { result, unmount } = renderAssigner();
        expect(result.current.assignButtonProps.canAssign).toBe(false);
        unmount();
      });
    });

    it('shows student flashcard loading when either load flag is set', () => {
      readyStudent();
      const flashcardError = new Error('flashcards failed');
      overrideFlashcardsQuery({
        flashcards: [],
        isLoading: true,
        isFetchingFlashcards: false,
        error: flashcardError,
      });
      const loading = renderAssigner();
      expect(
        loading.result.current.assignedStudentFlashcardsProps?.isLoading,
      ).toBe(true);
      expect(loading.result.current.assignedStudentFlashcardsProps?.error).toBe(
        flashcardError,
      );
      loading.unmount();

      overrideFlashcardsQuery({
        flashcards: [],
        isLoading: false,
        isFetchingFlashcards: true,
        error: null,
      });
      const fetching = renderAssigner();
      expect(
        fetching.result.current.assignedStudentFlashcardsProps?.isLoading,
      ).toBe(true);
      expect(fetching.result.current.unassignedExamplesProps.isLoading).toBe(
        true,
      );
    });

    it('shows quiz loading when the quiz, its examples, or its group are loading', () => {
      const quizzes = [buildQuiz(10, 3, 'Animals', 7)];
      overrideMockUseAllQuizGroups({
        quizGroups: [buildGroup(7, 'Alpha', 'alpha', quizzes)],
        isLoading: true,
        error: null,
      });
      overrideMockUseQuizExamples({
        data: [],
        isLoading: false,
        isFetching: false,
        error: null,
      });
      const groupLoading = renderAssigner();
      selectQuiz(groupLoading.result, 7, 10);
      expect(
        groupLoading.result.current.assignedQuizExamplesProps?.isLoading,
      ).toBe(true);
      groupLoading.unmount();

      overrideMockUseAllQuizGroups({
        quizGroups: [buildGroup(7, 'Alpha', 'alpha', quizzes)],
        isLoading: false,
        error: null,
      });
      const quizError = new Error('quiz failed');
      overrideMockUseQuizExamples({
        data: [],
        isLoading: false,
        isFetching: true,
        error: quizError,
      });
      const fetching = renderAssigner();
      selectQuiz(fetching.result, 7, 10);
      expect(fetching.result.current.assignedQuizExamplesProps?.isLoading).toBe(
        true,
      );
      expect(fetching.result.current.assignedQuizExamplesProps?.error).toBe(
        quizError,
      );
    });
  });
});

function numberedExamples(count: number): ExampleWithVocabulary[] {
  return createMockExampleWithVocabularyList(count).map((example, index) => ({
    ...example,
    id: index + 1,
  }));
}

function flashcardsFor(examples: ExampleWithVocabulary[]): Flashcard[] {
  return examples.map((example) => createMockFlashcard({ example }));
}

function buildQuiz(
  id: number,
  quizNumber: number,
  quizTitle: string,
  groupId: number,
) {
  return {
    id,
    quizNumber,
    quizTitle,
    published: true,
    relatedQuizGroupId: groupId,
  };
}

function buildGroup(
  id: number,
  name: string,
  urlSlug: string,
  quizzes: ReturnType<typeof buildQuiz>[],
) {
  return createMockQuizGroup({
    id,
    name,
    urlSlug,
    courseId: 1,
    published: true,
    quizzes,
  });
}

function renderAssigner() {
  return renderHook(() => useExampleAssigner(), {
    wrapper: MockAllProviders,
  });
}

function selectQuiz(
  result: { current: UseExampleAssignerReturn },
  groupId: number | undefined,
  quizId: number | undefined,
): void {
  act(() => {
    result.current.assignmentTypeSelectorProps.onTypeChange('quiz');
    result.current.quizSelectionProps.onQuizGroupIdChange(groupId);
    result.current.quizSelectionProps.onQuizRecordIdChange(quizId);
  });
}
