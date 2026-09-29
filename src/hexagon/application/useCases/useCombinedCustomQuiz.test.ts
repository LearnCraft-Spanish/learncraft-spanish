import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockAudioAdapter,
  resetMockAudioAdapter,
} from '@application/adapters/audioAdapter.mock';
import { mockLastStudiedLessonAdapter } from '@application/adapters/lastStudiedLessonAdapter.mock';
import { overrideMockSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import {
  mockUseExampleQuery,
  overrideMockUseExampleQuery,
  readMockUseExampleQuery,
  resetMockUseExampleQuery,
} from '@application/queries/ExampleQueries/useExampleQuery.mock';
import {
  CombinedCustomQuizType,
  useCombinedCustomQuiz,
} from '@application/useCases/useCombinedCustomQuiz';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import silence1s from 'src/assets/audio/1s.mp3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/audioAdapter', () => ({
  useAudioAdapter: () => mockAudioAdapter,
}));

vi.mock('@application/queries/ExampleQueries/useExampleQuery', () => ({
  useExampleQuery: mockUseExampleQuery,
}));

const student = getAppUserFromEmail('student-no-flashcards@fake.not')!;

const lcspCourse = {
  id: 2,
  name: 'LearnCraft Spanish',
  published: true,
  lessons: [
    { id: 71, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
    { id: 79, lessonNumber: 10, courseName: 'LearnCraft Spanish' },
  ],
};

function createExamples(
  count: number,
  spanishAudio: (index: number) => string = () =>
    'https://audio.example/clip.mp3',
): ExampleWithVocabulary[] {
  return createMockExampleWithVocabularyList(count).map((example, index) => ({
    ...example,
    id: index + 1,
    spanishAudio: spanishAudio(index),
  }));
}

function serveExamples(
  examples: ExampleWithVocabulary[],
  totalCount: number | null = examples.length,
) {
  overrideMockUseExampleQuery({
    filteredExamples: examples,
    totalCount,
    isLoading: false,
    isDependenciesLoading: false,
    error: null,
  });
}

function selectCourse() {
  overrideMockSelectedCourseAndLessons({
    course: lcspCourse,
    courseId: lcspCourse.id,
    fromLesson: lcspCourse.lessons[0],
    fromLessonNumber: 2,
    toLesson: lcspCourse.lessons[1],
    toLessonNumber: 10,
  });
}

function renderCombinedQuiz() {
  return renderHook(() => useCombinedCustomQuiz(), {
    wrapper: TestQueryClientProvider,
  });
}

describe('useCombinedCustomQuiz last studied lesson recording', () => {
  beforeEach(() => {
    resetMockUseExampleQuery();
    resetMockAudioAdapter();
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-no-flashcards@fake.not')!,
        isAuthenticated: true,
        isStudent: true,
        isCoach: false,
        isAdmin: false,
        isLimited: false,
      },
      { appUser: student, isOwnUser: true },
    );
  });

  it('records the selected To lesson when the quiz starts', async () => {
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      toLesson: lcspCourse.lessons[1],
      toLessonNumber: 10,
    });

    const { result } = renderHook(() => useCombinedCustomQuiz(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.readyQuiz();
    });

    await waitFor(() =>
      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledWith({
        email: student.emailAddress,
        courseId: lcspCourse.id,
        lessonNumber: 10,
      }),
    );
  });

  it('does not record when no lesson is selected', async () => {
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      toLesson: null,
      toLessonNumber: null,
    });

    const { result } = renderHook(() => useCombinedCustomQuiz(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(
      mockLastStudiedLessonAdapter.setLastStudiedLesson,
    ).not.toHaveBeenCalled();
  });

  it('does not record when a coach is viewing another student', async () => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-admin@fake.not')!,
        isAuthenticated: true,
        isStudent: false,
        isCoach: true,
        isAdmin: false,
        isLimited: false,
      },
      { appUser: student, isOwnUser: false },
    );
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      toLesson: lcspCourse.lessons[1],
      toLessonNumber: 10,
    });

    const { result } = renderHook(() => useCombinedCustomQuiz(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(
      mockLastStudiedLessonAdapter.setLastStudiedLesson,
    ).not.toHaveBeenCalled();
  });
});

describe('useCombinedCustomQuiz loading, mode, and snapshot', () => {
  beforeEach(() => {
    resetMockUseExampleQuery();
    resetMockAudioAdapter();
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-no-flashcards@fake.not')!,
        isAuthenticated: true,
        isStudent: true,
        isCoach: false,
        isAdmin: false,
        isLimited: false,
      },
      { appUser: student, isOwnUser: true },
    );
    selectCourse();
  });

  it('treats the first load as initial and a later filter load as a refresh', () => {
    overrideMockUseExampleQuery({
      isLoading: true,
      isDependenciesLoading: false,
      filteredExamples: null,
      totalCount: null,
    });
    const { result, rerender } = renderCombinedQuiz();

    expect(result.current.isLoadingExamples).toBe(true);
    expect(result.current.isInitialLoading).toBe(true);

    overrideMockUseExampleQuery({
      isLoading: false,
      filteredExamples: [],
      totalCount: 0,
    });
    rerender();
    expect(result.current.totalCount).toBe(0);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isLoadingExamples).toBe(false);

    overrideMockUseExampleQuery({
      isLoading: true,
      filteredExamples: null,
      totalCount: null,
    });
    rerender();
    expect(result.current.isLoadingExamples).toBe(true);
    expect(result.current.isInitialLoading).toBe(false);

    serveExamples(createExamples(10));
    rerender();
    expect(result.current.isLoadingExamples).toBe(false);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.totalCount).toBe(10);
  });

  it('keeps text examples when audio mode has nothing to play', async () => {
    const examples = createExamples(15, () => '');
    serveExamples(examples);
    const { result } = renderCombinedQuiz();

    expect(result.current.totalCount).toBe(15);
    expect(result.current.quizType).toBe(CombinedCustomQuizType.Text);
    expect(mockUseExampleQuery).toHaveBeenCalledWith(150, false, false);
    expect(result.current.textQuizSetup.totalCount).toBe(15);
    expect(result.current.audioQuizSetup.totalExamples).toBe(0);
    expect(result.current.quizNotReady).toBe(false);

    await act(async () => {
      result.current.setQuizType(CombinedCustomQuizType.Audio);
    });

    expect(mockUseExampleQuery).toHaveBeenCalledWith(150, true, false);
    expect(result.current.quizType).toBe(CombinedCustomQuizType.Audio);
    expect(result.current.textQuizSetup.totalCount).toBe(15);
    expect(result.current.audioQuizSetup.totalExamples).toBe(0);
    expect(result.current.quizNotReady).toBe(true);
  });

  it('snapshots a shuffled text slice and leaves the audio quiz empty', async () => {
    const examples = createExamples(12);
    serveExamples(examples);
    const { result } = renderCombinedQuiz();
    await waitFor(() =>
      expect(result.current.textQuizSetup.quizLength).toBe(10),
    );

    const prepared = result.current.textQuizSetup.examplesToQuiz;
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.mocked(readMockUseExampleQuery().updatePageSize).mockClear();

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(result.current.quizReady).toBe(true);
    expect(result.current.textQuizProps.examples).toEqual(
      fisherYatesShuffle(prepared).slice(0, 10),
    );
    expect(result.current.textQuizProps.examples).not.toEqual(prepared);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
    expect(mockAudioAdapter.primeAudioElement).not.toHaveBeenCalled();
    expect(
      vi.mocked(readMockUseExampleQuery().updatePageSize),
    ).not.toHaveBeenCalled();
    expect(result.current.textQuizProps.startWithSpanish).toBe(false);

    await act(async () => {
      result.current.textQuizProps.cleanupFunction();
    });
    expect(result.current.quizReady).toBe(false);
    expect(result.current.textQuizProps.examples).toEqual([]);

    await act(async () => {
      result.current.setQuizReady(true);
    });
    expect(result.current.textQuizProps.examples).toEqual([]);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
  });

  it('snapshots only examples with audio and primes playback', async () => {
    const examples = createExamples(15, (index) =>
      index < 12 ? 'https://audio.example/clip.mp3' : '',
    );
    const audible = examples.filter(
      (example) => example.spanishAudio.length > 0,
    );
    serveExamples(examples);
    const { result } = renderCombinedQuiz();
    await waitFor(() => expect(result.current.isLoadingExamples).toBe(false));

    await act(async () => {
      result.current.setQuizType(CombinedCustomQuizType.Audio);
    });
    await waitFor(() =>
      expect(result.current.audioQuizSetup.totalExamples).toBe(12),
    );
    expect(result.current.audioQuizSetup.selectedQuizLength).toBe(10);
    expect(result.current.quizNotReady).toBe(false);

    vi.spyOn(Math, 'random').mockReturnValue(0);
    mockAudioAdapter.primeAudioElement.mockClear();
    vi.mocked(readMockUseExampleQuery().updatePageSize).mockClear();

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(result.current.audioQuizProps.examplesToQuiz).toEqual(
      fisherYatesShuffle(audible).slice(0, 10),
    );
    expect(result.current.textQuizProps.examples).toEqual([]);
    expect(mockAudioAdapter.primeAudioElement).toHaveBeenCalledTimes(1);
    expect(mockAudioAdapter.primeAudioElement).toHaveBeenCalledWith(silence1s);
    expect(
      vi.mocked(readMockUseExampleQuery().updatePageSize),
    ).not.toHaveBeenCalled();
    expect(result.current.audioQuizProps.ready).toBe(true);

    await act(async () => {
      result.current.audioQuizProps.cleanupFunction();
    });
    expect(result.current.quizReady).toBe(false);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
    expect(result.current.audioQuizProps.ready).toBe(false);

    await act(async () => {
      result.current.setQuizReady(true);
    });
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
  });

  it('loads a larger page only when a text quiz is longer than 150', async () => {
    serveExamples(createExamples(151));
    const textQuiz = renderCombinedQuiz();
    await waitFor(() => expect(textQuiz.result.current.totalCount).toBe(151));
    await act(async () => {
      textQuiz.result.current.textQuizSetup.setSelectedQuizLength(151);
    });
    expect(textQuiz.result.current.textQuizSetup.quizLength).toBe(151);
    vi.mocked(readMockUseExampleQuery().updatePageSize).mockClear();
    mockAudioAdapter.primeAudioElement.mockClear();

    await act(async () => {
      textQuiz.result.current.readyQuiz();
    });
    expect(
      vi.mocked(readMockUseExampleQuery().updatePageSize),
    ).toHaveBeenCalledTimes(1);
    expect(
      vi.mocked(readMockUseExampleQuery().updatePageSize),
    ).toHaveBeenCalledWith(151);
    expect(mockAudioAdapter.primeAudioElement).not.toHaveBeenCalled();
    expect(textQuiz.result.current.textQuizProps.examples).toHaveLength(151);
    textQuiz.unmount();

    serveExamples(createExamples(150));
    const atBoundary = renderCombinedQuiz();
    await waitFor(() => expect(atBoundary.result.current.totalCount).toBe(150));
    await act(async () => {
      atBoundary.result.current.textQuizSetup.setSelectedQuizLength(150);
    });
    expect(atBoundary.result.current.textQuizSetup.quizLength).toBe(150);
    vi.mocked(readMockUseExampleQuery().updatePageSize).mockClear();

    await act(async () => {
      atBoundary.result.current.readyQuiz();
    });
    expect(
      vi.mocked(readMockUseExampleQuery().updatePageSize),
    ).not.toHaveBeenCalled();
    atBoundary.unmount();

    serveExamples(createExamples(151));
    const audioQuiz = renderCombinedQuiz();
    await waitFor(() => expect(audioQuiz.result.current.totalCount).toBe(151));
    await act(async () => {
      audioQuiz.result.current.setQuizType(CombinedCustomQuizType.Audio);
    });
    await waitFor(() =>
      expect(audioQuiz.result.current.audioQuizSetup.totalExamples).toBe(151),
    );
    await act(async () => {
      audioQuiz.result.current.audioQuizSetup.setSelectedQuizLength(151);
    });
    expect(audioQuiz.result.current.audioQuizSetup.selectedQuizLength).toBe(
      151,
    );
    vi.mocked(readMockUseExampleQuery().updatePageSize).mockClear();
    mockAudioAdapter.primeAudioElement.mockClear();

    await act(async () => {
      audioQuiz.result.current.readyQuiz();
    });
    expect(
      vi.mocked(readMockUseExampleQuery().updatePageSize),
    ).not.toHaveBeenCalled();
    expect(mockAudioAdapter.primeAudioElement).toHaveBeenCalledWith(silence1s);
    audioQuiz.unmount();
  });
});
