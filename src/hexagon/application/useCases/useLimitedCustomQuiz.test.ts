import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { mockLastStudiedLessonAdapter } from '@application/adapters/lastStudiedLessonAdapter.mock';
import { overrideMockSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import { useLimitedCustomQuiz } from '@application/useCases/useLimitedCustomQuiz';
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

vi.mock('@application/adapters/audioAdapter', () => ({
  useAudioAdapter: () => ({ primeAudioElement }),
}));

// recordId 4, courseId 2, lessonNumber 15
const limitedUser = getAppUserFromEmail('limited@fake.not')!;

const lcspCourse = {
  id: 2,
  name: 'LearnCraft Spanish',
  published: true,
  lessons: [
    { id: 71, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
    { id: 84, lessonNumber: 15, courseName: 'LearnCraft Spanish' },
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

function selectCourse() {
  overrideMockSelectedCourseAndLessons({
    course: lcspCourse,
    courseId: lcspCourse.id,
    fromLesson: lcspCourse.lessons[0],
    fromLessonNumber: 2,
    toLesson: lcspCourse.lessons[1],
    toLessonNumber: 15,
  });
}

function renderLimitedQuiz() {
  return renderHook(() => useLimitedCustomQuiz(), {
    wrapper: TestQueryClientProvider,
  });
}

describe('useLimitedCustomQuiz last studied lesson recording', () => {
  beforeEach(() => {
    primeAudioElement.mockClear();
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('limited@fake.not')!,
        isAuthenticated: true,
        isStudent: false,
        isCoach: false,
        isAdmin: false,
        isLimited: true,
      },
      { appUser: limitedUser, isOwnUser: true },
    );
  });

  it('records the selected To lesson when the quiz starts', async () => {
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      toLesson: lcspCourse.lessons[1],
      toLessonNumber: 15,
    });

    const { result } = renderHook(() => useLimitedCustomQuiz(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.readyQuiz();
    });

    await waitFor(() =>
      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledWith({
        email: limitedUser.emailAddress,
        courseId: lcspCourse.id,
        lessonNumber: 15,
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

    const { result } = renderHook(() => useLimitedCustomQuiz(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(
      mockLastStudiedLessonAdapter.setLastStudiedLesson,
    ).not.toHaveBeenCalled();
  });

  it('records for a free user with no app data', async () => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('limited@fake.not')!,
        isAuthenticated: true,
        isStudent: false,
        isCoach: false,
        isAdmin: false,
        isLimited: true,
      },
      { appUser: null, isOwnUser: true },
    );
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      toLesson: lcspCourse.lessons[1],
      toLessonNumber: 15,
    });

    const { result } = renderHook(() => useLimitedCustomQuiz(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.readyQuiz();
    });

    await waitFor(() =>
      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledWith({
        email: 'limited@fake.not',
        courseId: lcspCourse.id,
        lessonNumber: 15,
      }),
    );
  });
});

describe('useLimitedCustomQuiz loading and snapshot', () => {
  beforeEach(() => {
    primeAudioElement.mockClear();
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('limited@fake.not')!,
        isAuthenticated: true,
        isStudent: false,
        isCoach: false,
        isAdmin: false,
        isLimited: true,
      },
      { appUser: limitedUser, isOwnUser: true },
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

    const { result, rerender } = renderLimitedQuiz();

    await waitFor(() => expect(result.current.isLoadingExamples).toBe(true));
    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.quizNotReady).toBe(true);

    releaseFirst({ examples: [], totalCount: 0 });
    await waitFor(() => expect(result.current.totalCount).toBe(0));
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.quizNotReady).toBe(true);

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
    expect(result.current.quizNotReady).toBe(false);
    expect(result.current.audioQuizSetup.totalExamples).toBe(10);
  });

  it('requests audio examples on a page of 150 and still caches them for staff', async () => {
    const calls: Array<{
      audioOnly?: boolean;
      limit: number;
      disableCache?: boolean;
    }> = [];
    overrideMockExampleAdapter({
      getFilteredExamples: async (params) => {
        calls.push({
          audioOnly: params.audioOnly,
          limit: params.limit,
          disableCache: params.disableCache,
        });
        return { examples: createExamples(4), totalCount: 4 };
      },
    });

    const studentView = renderLimitedQuiz();
    await waitFor(() =>
      expect(studentView.result.current.isLoadingExamples).toBe(false),
    );
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call).toEqual({
        audioOnly: true,
        limit: 150,
        disableCache: false,
      });
    }
    studentView.unmount();

    calls.length = 0;
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-admin@fake.not')!,
        isAuthenticated: true,
        isStudent: false,
        isCoach: true,
        isAdmin: true,
        isLimited: false,
      },
      { appUser: limitedUser, isOwnUser: true },
    );
    const staffView = renderLimitedQuiz();
    await waitFor(() => expect(staffView.result.current.totalCount).toBe(4));
    for (const call of calls) {
      expect(call.disableCache).toBe(false);
      expect(call.audioOnly).toBe(true);
      expect(call.limit).toBe(150);
    }
    staffView.unmount();
  });

  it('snapshots every loaded example, including ones without audio, and then clears it', async () => {
    const examples = createExamples(5, (index) =>
      index === 0 ? '' : 'https://audio.example/clip.mp3',
    );
    overrideMockExampleAdapter({
      getFilteredExamples: async () => ({
        examples,
        totalCount: examples.length,
      }),
    });
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const { result } = renderLimitedQuiz();
    await waitFor(() =>
      expect(result.current.audioQuizSetup.selectedQuizLength).toBe(5),
    );
    expect(result.current.quizNotReady).toBe(false);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
    expect(result.current.audioQuizProps.ready).toBe(false);

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(result.current.quizReady).toBe(true);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual(
      fisherYatesShuffle(examples).slice(0, 5),
    );
    expect(
      result.current.audioQuizProps.examplesToQuiz.map((example) => example.id),
    ).toContain(1);
    expect(primeAudioElement).toHaveBeenCalledTimes(1);
    expect(primeAudioElement).toHaveBeenCalledWith(silence1s);
    expect(result.current.audioQuizProps.ready).toBe(true);

    await act(async () => {
      result.current.audioQuizProps.cleanupFunction();
    });
    expect(result.current.quizReady).toBe(false);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);

    await act(async () => {
      result.current.setQuizReady(true);
    });
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
    expect(result.current.audioQuizProps.ready).toBe(true);
  });

  it('surfaces an example load failure', async () => {
    overrideMockExampleAdapter({
      getFilteredExamples: async () => {
        throw new Error('examples failed');
      },
    });

    const { result } = renderLimitedQuiz();

    await waitFor(() =>
      expect(result.current.errorExamples).toBeInstanceOf(Error),
    );
    expect(result.current.errorExamples?.message).toBe('examples failed');
    expect(result.current.quizNotReady).toBe(true);
  });
});
