import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockAudioAdapter,
  resetMockAudioAdapter,
} from '@application/adapters/audioAdapter.mock';
import { mockLastStudiedLessonAdapter } from '@application/adapters/lastStudiedLessonAdapter.mock';
import { overrideMockSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import { overrideMockUseUsingAsStudent } from '@application/coordinators/hooks/useUsingAsStudent.mock';
import {
  mockUseExampleQuery,
  overrideMockUseExampleQuery,
  resetMockUseExampleQuery,
} from '@application/queries/ExampleQueries/useExampleQuery.mock';
import {
  CustomQuizType,
  useCustomQuizV2,
} from '@application/useCases/useCustomQuizV2';
import { AudioQuizType } from '@domain/audioQuizzing';
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

function renderCustomQuiz() {
  return renderHook(() => useCustomQuizV2(), {
    wrapper: TestQueryClientProvider,
  });
}

/** Serves `available` examples on the page out of `total` matches. */
function serveExamples(available: number, total = available) {
  overrideMockUseExampleQuery({
    filteredExamples: createMockExampleWithVocabularyList(available),
    totalCount: total,
    isLoading: false,
    isDependenciesLoading: false,
    error: null,
  });
}

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

describe('useCustomQuizV2', () => {
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
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      fromLesson: lcspCourse.lessons[0],
      fromLessonNumber: 2,
      toLesson: lcspCourse.lessons[1],
      toLessonNumber: 10,
    });
  });

  it('starts on a flashcard quiz of twenty', async () => {
    serveExamples(150, 6992);
    const { result } = renderCustomQuiz();

    await waitFor(() => expect(result.current.quizLength).toBe(20));

    expect(result.current.quizType).toBe(CustomQuizType.Flashcards);
    expect(result.current.isAudioQuiz).toBe(false);
    expect(result.current.quizLengthOptions).toEqual([10, 20, 50, 100, 150]);
  });

  it('drops the lengths the set cannot fill and offers its exact size', async () => {
    serveExamples(76);
    const { result } = renderCustomQuiz();

    await waitFor(() =>
      expect(result.current.quizLengthOptions).toEqual([10, 20, 50, 76]),
    );
  });

  it('holds a length too long for the set down to the largest that fits', async () => {
    serveExamples(76);
    const { result } = renderCustomQuiz();

    await waitFor(() => expect(result.current.quizLength).toBe(20));

    await act(async () => {
      result.current.setQuizLength(100);
    });

    expect(result.current.quizLength).toBe(76);
  });

  it('moves an odd length down to a preset once the set grows', async () => {
    serveExamples(36);
    const { result, rerender } = renderCustomQuiz();

    await waitFor(() =>
      expect(result.current.quizLengthOptions).toEqual([10, 20, 36]),
    );

    await act(async () => {
      result.current.setQuizLength(36);
    });
    expect(result.current.quizLength).toBe(36);

    serveExamples(150, 1000);
    overrideMockSelectedCourseAndLessons({
      toLesson: lcspCourse.lessons[0],
      toLessonNumber: 2,
    });
    await act(async () => {
      rerender();
    });

    await waitFor(() =>
      expect(result.current.quizLengthOptions).toEqual([10, 20, 50, 100, 150]),
    );
    expect(result.current.quizLength).toBe(20);
  });

  it('offers no length when nothing matches', async () => {
    serveExamples(0);
    const { result } = renderCustomQuiz();

    await waitFor(() => expect(result.current.isLoadingExamples).toBe(false));

    expect(result.current.quizLengthOptions).toEqual([]);
    expect(result.current.quizLength).toBe(0);
    expect(result.current.quizNotReady).toBe(true);
  });

  it('names the course and starting lesson', () => {
    const { result } = renderCustomQuiz();

    expect(result.current.fromLessonText).toBe('From lesson lcsp 2');
  });

  it('switching to audio changes the noun in both count and CTA', async () => {
    const { result } = renderCustomQuiz();

    await act(async () => {
      result.current.setQuizType(CustomQuizType.Audio);
    });

    expect(result.current.isAudioQuiz).toBe(true);
    expect(result.current.countLabel).toContain('audio examples found');
    expect(result.current.ctaLabel).toContain('audio examples');
  });

  it('the CTA caps at the quiz length while the count keeps the total', async () => {
    serveExamples(150, 6992);
    const { result } = renderCustomQuiz();

    await waitFor(() => expect(result.current.totalCount).toBe(6992));

    await act(async () => {
      result.current.setQuizLength(10);
    });

    expect(result.current.effectiveCount).toBe(10);
    expect(result.current.countLabel).toBe('6,992 flashcards found');
    expect(result.current.ctaLabel).toBe('Quiz 10 flashcards');
  });

  it('the longest option drills everything the page holds', async () => {
    serveExamples(76);
    const { result } = renderCustomQuiz();

    await waitFor(() => expect(result.current.totalCount).toBe(76));

    await act(async () => {
      result.current.setQuizLength(76);
    });

    expect(result.current.effectiveCount).toBe(76);
  });

  it('draws no more than the chosen length when the quiz starts', async () => {
    serveExamples(76);
    const { result } = renderCustomQuiz();

    await waitFor(() => expect(result.current.quizLength).toBe(20));

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(result.current.textQuizProps.examples).toHaveLength(20);
  });

  it('records the selected To lesson when the quiz starts', async () => {
    const { result } = renderCustomQuiz();

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

  it('does not record a lesson when none is selected', async () => {
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      toLesson: null,
      toLessonNumber: null,
    });

    const { result } = renderCustomQuiz();

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(
      mockLastStudiedLessonAdapter.setLastStudiedLesson,
    ).not.toHaveBeenCalled();
  });

  it('holds the quiz props back until the quiz is readied', () => {
    const { result } = renderCustomQuiz();

    expect(result.current.quizReady).toBe(false);
    expect(result.current.textQuizProps.examples).toEqual([]);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
    expect(result.current.audioQuizProps.ready).toBe(false);
  });

  it('carries the chosen audio mode into the audio quiz', async () => {
    const { result } = renderCustomQuiz();

    expect(result.current.audioQuizProps.audioQuizType).toBe('speaking');

    await act(async () => {
      result.current.setAudioQuizType(AudioQuizType.Listening);
    });

    expect(result.current.audioQuizProps.audioQuizType).toBe('listening');
  });

  it('leaves the audio mode alone when the text quiz starts in Spanish', async () => {
    const { result } = renderCustomQuiz();

    await act(async () => {
      result.current.setStartWithSpanish(true);
    });

    expect(result.current.textQuizProps.startWithSpanish).toBe(true);
    expect(result.current.audioQuizProps.audioQuizType).toBe('speaking');
  });

  it('autoplays by default and can be turned off', async () => {
    const { result } = renderCustomQuiz();

    expect(result.current.audioQuizProps.autoplay).toBe(true);

    await act(async () => {
      result.current.setAutoplay(false);
    });

    expect(result.current.audioQuizProps.autoplay).toBe(false);
  });

  describe('flashcard controls', () => {
    function asCoach(): void {
      overrideAuthAndAppUser(
        {
          authUser: getAuthUserFromEmail('student-admin@fake.not')!,
          isAuthenticated: true,
          isStudent: true,
          isCoach: true,
          isAdmin: false,
          isLimited: false,
        },
        { appUser: student, isOwnUser: false },
      );
    }

    it('lets a student add and remove flashcards in either quiz', () => {
      const { result } = renderCustomQuiz();

      expect(result.current.textQuizProps.canCollect).toBe(true);
      expect(result.current.audioQuizProps.canCollect).toBe(true);
    });

    it('hides them for a coach who is not using the app as a student', () => {
      asCoach();

      const { result } = renderCustomQuiz();

      expect(result.current.textQuizProps.canCollect).toBe(false);
      expect(result.current.audioQuizProps.canCollect).toBe(false);
    });

    it('keeps them for a coach using the app as a student', () => {
      asCoach();
      overrideMockUseUsingAsStudent({ isUsingAsStudent: true });

      const { result } = renderCustomQuiz();

      expect(result.current.textQuizProps.canCollect).toBe(true);
      expect(result.current.audioQuizProps.canCollect).toBe(true);
    });
  });

  it('treats the first load as initial and a later filter load as a refresh', () => {
    overrideMockUseExampleQuery({
      isLoading: true,
      isDependenciesLoading: false,
      filteredExamples: null,
      totalCount: null,
    });
    const { result, rerender } = renderCustomQuiz();

    expect(result.current.isLoadingExamples).toBe(true);
    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.quizLengthOptions).toEqual([]);
    expect(result.current.quizNotReady).toBe(true);

    overrideMockUseExampleQuery({
      isLoading: false,
      filteredExamples: [],
      totalCount: 0,
    });
    rerender();
    expect(result.current.totalCount).toBe(0);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.quizNotReady).toBe(true);

    overrideMockUseExampleQuery({
      isLoading: true,
      filteredExamples: null,
      totalCount: null,
    });
    rerender();
    expect(result.current.isLoadingExamples).toBe(true);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.quizLengthOptions).toEqual([]);

    overrideMockUseExampleQuery({
      isLoading: false,
      filteredExamples: createExamples(10),
      totalCount: 10,
    });
    rerender();
    expect(result.current.quizLengthOptions).toEqual([10]);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.quizNotReady).toBe(false);
  });

  it('holds the last loaded count while a filter is in flight, then keeps only audio examples', async () => {
    const examples = createExamples(8, (index) =>
      index < 2 ? '' : 'https://audio.example/clip.mp3',
    );
    overrideMockUseExampleQuery({
      filteredExamples: examples,
      totalCount: examples.length,
      isLoading: false,
      isDependenciesLoading: false,
      error: null,
    });

    const { result, rerender } = renderCustomQuiz();
    expect(result.current.quizLengthOptions).toEqual([8]);
    expect(result.current.quizLength).toBe(8);
    expect(result.current.isAudioQuiz).toBe(false);

    overrideMockUseExampleQuery({
      filteredExamples: null,
      totalCount: null,
      isLoading: true,
    });
    rerender();
    expect(result.current.quizLengthOptions).toEqual([8]);

    await act(async () => {
      result.current.setQuizType(CustomQuizType.Audio);
    });

    expect(result.current.isLoadingExamples).toBe(true);
    expect(result.current.isAudioQuiz).toBe(true);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.quizLengthOptions).toEqual([8]);
    expect(result.current.quizLength).toBe(8);

    overrideMockUseExampleQuery({
      filteredExamples: examples,
      totalCount: examples.length,
      isLoading: false,
    });
    rerender();
    expect(result.current.quizLengthOptions).toEqual([6]);
    expect(result.current.quizLength).toBe(6);
    expect(result.current.isLoadingExamples).toBe(false);

    vi.spyOn(Math, 'random').mockReturnValue(0);
    const audible = examples.filter(
      (example) => example.spanishAudio.length > 0,
    );
    mockAudioAdapter.primeAudioElement.mockClear();

    await act(async () => {
      result.current.readyQuiz();
    });

    const drawn = result.current.textQuizProps.examples ?? [];
    expect(result.current.quizReady).toBe(true);
    expect(drawn).toEqual(fisherYatesShuffle(audible).slice(0, 6));
    expect(result.current.audioQuizProps.examplesToQuiz).toBe(
      result.current.textQuizProps.examples,
    );
    expect(drawn.every((example) => example.spanishAudio.length > 0)).toBe(
      true,
    );
    expect(mockAudioAdapter.primeAudioElement).toHaveBeenCalledTimes(1);
    expect(mockAudioAdapter.primeAudioElement).toHaveBeenCalledWith(silence1s);
  });

  it('shuffles a text slice without priming audio, then cleanup empties both quizzes', async () => {
    const examples = createExamples(8, (index) =>
      index === 0 ? '' : 'https://audio.example/clip.mp3',
    );
    overrideMockUseExampleQuery({
      filteredExamples: examples,
      totalCount: examples.length,
      isLoading: false,
      isDependenciesLoading: false,
      error: null,
    });
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const { result } = renderCustomQuiz();
    expect(result.current.quizLength).toBe(8);

    await act(async () => {
      result.current.readyQuiz();
    });

    const drawn = result.current.textQuizProps.examples ?? [];
    expect(drawn).toEqual(fisherYatesShuffle(examples).slice(0, 8));
    expect(drawn).not.toEqual(examples);
    expect(drawn.map((example) => example.id)).toContain(1);
    expect(result.current.audioQuizProps.examplesToQuiz).toBe(
      result.current.textQuizProps.examples,
    );
    expect(mockAudioAdapter.primeAudioElement).not.toHaveBeenCalled();

    await act(async () => {
      result.current.textQuizProps.cleanupFunction();
    });

    expect(result.current.quizReady).toBe(false);
    expect(result.current.textQuizProps.examples).toEqual([]);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
    expect(result.current.audioQuizProps.ready).toBe(false);
    expect(result.current.audioQuizProps.cleanupFunction).toBe(
      result.current.textQuizProps.cleanupFunction,
    );
  });

  it('reports a course failure and an example failure', async () => {
    overrideMockSelectedCourseAndLessons({
      error: new Error('course failed'),
    });
    serveExamples(10);

    const courseFailure = renderCustomQuiz();
    await waitFor(() =>
      expect(courseFailure.result.current.error?.message).toBe('course failed'),
    );
    courseFailure.unmount();

    overrideMockSelectedCourseAndLessons({ error: null });
    overrideMockUseExampleQuery({
      error: new Error('examples failed'),
      filteredExamples: null,
      totalCount: null,
      isLoading: false,
    });
    const exampleFailure = renderCustomQuiz();
    expect(exampleFailure.result.current.error?.message).toBe(
      'examples failed',
    );
  });
});
