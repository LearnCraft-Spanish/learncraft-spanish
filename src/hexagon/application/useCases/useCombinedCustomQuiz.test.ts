import type { UseExampleQueryReturnType } from '@application/queries/ExampleQueries/useExampleQuery';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { mockLastStudiedLessonAdapter } from '@application/adapters/lastStudiedLessonAdapter.mock';
import { overrideMockSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import {
  CombinedCustomQuizType,
  useCombinedCustomQuiz,
} from '@application/useCases/useCombinedCustomQuiz';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import silence1s from 'src/assets/audio/1s.mp3';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const primeAudioElement = vi.hoisted(() =>
  vi.fn<(silenceUrl: string) => void>(),
);

const exampleQueryCalls = vi.hoisted(
  () =>
    [] as Array<{
      pageSize: number;
      audioRequired: boolean | undefined;
      disableCache: boolean;
    }>,
);

const updatePageSizeSpy = vi.hoisted(() =>
  vi.fn<(newPageSize: number) => void>(),
);

vi.mock('@application/adapters/audioAdapter', () => ({
  useAudioAdapter: () => ({ primeAudioElement }),
}));

interface ExampleQueryModule {
  useExampleQuery: (
    pageSize: number,
    audioRequired?: boolean,
    disableCache?: boolean,
  ) => UseExampleQueryReturnType;
}

vi.mock('@application/queries/ExampleQueries/useExampleQuery', async () => {
  const actual = (await vi.importActual(
    '@application/queries/ExampleQueries/useExampleQuery',
  )) as ExampleQueryModule;

  return {
    useExampleQuery: (
      pageSize: number,
      audioRequired?: boolean,
      disableCache = false,
    ) => {
      exampleQueryCalls.push({ pageSize, audioRequired, disableCache });
      const query = actual.useExampleQuery(
        pageSize,
        audioRequired,
        disableCache,
      );
      return {
        ...query,
        updatePageSize: (newPageSize: number) => {
          updatePageSizeSpy(newPageSize);
          query.updatePageSize(newPageSize);
        },
      };
    },
  };
});

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
  return Array.from({ length: count }, (_, index) => {
    return {
      id: index + 1,
      spanishAudio: spanishAudio(index),
    } as ExampleWithVocabulary;
  });
}

function serveExamples(
  examples: ExampleWithVocabulary[],
  totalCount = examples.length,
) {
  overrideMockExampleAdapter({
    getFilteredExamples: async () => ({
      examples,
      totalCount,
    }),
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
    exampleQueryCalls.length = 0;
    updatePageSizeSpy.mockClear();
    primeAudioElement.mockClear();
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
    exampleQueryCalls.length = 0;
    updatePageSizeSpy.mockClear();
    primeAudioElement.mockClear();
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

  it('treats the first load as initial and a later filter load as a refresh', async () => {
    let callCount = 0;
    let releaseFirst: (value: {
      examples: ExampleWithVocabulary[];
      totalCount: number;
    }) => void = () => {};
    let releaseNext: (value: {
      examples: ExampleWithVocabulary[];
      totalCount: number;
    }) => void = () => {};
    overrideMockExampleAdapter({
      getFilteredExamples: () => {
        callCount += 1;
        if (callCount === 1) {
          return new Promise((resolve) => {
            releaseFirst = resolve;
          });
        }
        return new Promise((resolve) => {
          releaseNext = resolve;
        });
      },
    });

    const { result, rerender } = renderCombinedQuiz();

    await waitFor(() => expect(result.current.isLoadingExamples).toBe(true));
    expect(result.current.isInitialLoading).toBe(true);

    releaseFirst({ examples: [], totalCount: 0 });
    await waitFor(() => expect(result.current.totalCount).toBe(0));
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isLoadingExamples).toBe(false);

    overrideMockSelectedCourseAndLessons({
      toLesson: lcspCourse.lessons[0],
      toLessonNumber: 2,
    });
    rerender();

    await waitFor(() => expect(result.current.isLoadingExamples).toBe(true));
    expect(result.current.isInitialLoading).toBe(false);

    releaseNext({ examples: createExamples(10), totalCount: 10 });
    await waitFor(() => expect(result.current.isLoadingExamples).toBe(false));
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.totalCount).toBe(10);
  });

  it('keeps text examples when audio mode has nothing to play', async () => {
    const examples = createExamples(15, () => '');
    serveExamples(examples);
    const { result } = renderCombinedQuiz();

    await waitFor(() => expect(result.current.totalCount).toBe(15));
    expect(result.current.quizType).toBe(CombinedCustomQuizType.Text);
    expect(
      exampleQueryCalls.every((call) => call.audioRequired === false),
    ).toBe(true);
    expect(exampleQueryCalls.every((call) => call.pageSize === 150)).toBe(true);
    expect(result.current.textQuizSetup.totalCount).toBe(15);
    expect(result.current.audioQuizSetup.totalExamples).toBe(0);
    expect(result.current.quizNotReady).toBe(false);

    await act(async () => {
      result.current.setQuizType(CombinedCustomQuizType.Audio);
    });

    await waitFor(() =>
      expect(
        exampleQueryCalls.some((call) => call.audioRequired === true),
      ).toBe(true),
    );
    await waitFor(() => expect(result.current.isLoadingExamples).toBe(false));
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
    updatePageSizeSpy.mockClear();

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(result.current.quizReady).toBe(true);
    expect(result.current.textQuizProps.examples).toEqual(
      fisherYatesShuffle(prepared).slice(0, 10),
    );
    expect(result.current.textQuizProps.examples).not.toEqual(prepared);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
    expect(primeAudioElement).not.toHaveBeenCalled();
    expect(updatePageSizeSpy).not.toHaveBeenCalled();
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
    primeAudioElement.mockClear();
    updatePageSizeSpy.mockClear();

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(result.current.audioQuizProps.examplesToQuiz).toEqual(
      fisherYatesShuffle(audible).slice(0, 10),
    );
    expect(result.current.textQuizProps.examples).toEqual([]);
    expect(primeAudioElement).toHaveBeenCalledTimes(1);
    expect(primeAudioElement).toHaveBeenCalledWith(silence1s);
    expect(updatePageSizeSpy).not.toHaveBeenCalled();
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
    updatePageSizeSpy.mockClear();
    primeAudioElement.mockClear();

    await act(async () => {
      textQuiz.result.current.readyQuiz();
    });
    expect(updatePageSizeSpy).toHaveBeenCalledTimes(1);
    expect(updatePageSizeSpy).toHaveBeenCalledWith(151);
    expect(primeAudioElement).not.toHaveBeenCalled();
    expect(textQuiz.result.current.textQuizProps.examples).toHaveLength(151);
    textQuiz.unmount();

    serveExamples(createExamples(150));
    const atBoundary = renderCombinedQuiz();
    await waitFor(() => expect(atBoundary.result.current.totalCount).toBe(150));
    await act(async () => {
      atBoundary.result.current.textQuizSetup.setSelectedQuizLength(150);
    });
    expect(atBoundary.result.current.textQuizSetup.quizLength).toBe(150);
    updatePageSizeSpy.mockClear();

    await act(async () => {
      atBoundary.result.current.readyQuiz();
    });
    expect(updatePageSizeSpy).not.toHaveBeenCalled();
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
    updatePageSizeSpy.mockClear();
    primeAudioElement.mockClear();

    await act(async () => {
      audioQuiz.result.current.readyQuiz();
    });
    expect(updatePageSizeSpy).not.toHaveBeenCalled();
    expect(primeAudioElement).toHaveBeenCalledWith(silence1s);
    audioQuiz.unmount();
  });
});
