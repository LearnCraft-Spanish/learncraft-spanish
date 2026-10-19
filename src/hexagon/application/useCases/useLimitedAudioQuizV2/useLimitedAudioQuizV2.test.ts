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
  resetMockUseExampleQuery,
} from '@application/queries/ExampleQueries/useExampleQuery.mock';
import { useLimitedAudioQuizV2 } from '@application/useCases/useLimitedAudioQuizV2';
import { AudioQuizType } from '@domain/audioQuizzing';
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

const limitedUser = getAppUserFromEmail('limited@fake.not')!;

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

function serveExamples(examples: ExampleWithVocabulary[], total?: number) {
  overrideMockUseExampleQuery({
    filteredExamples: examples,
    totalCount: total ?? examples.length,
    isLoading: false,
    isDependenciesLoading: false,
    error: null,
  });
}

function renderLimitedAudioQuiz() {
  return renderHook(() => useLimitedAudioQuizV2(), {
    wrapper: TestQueryClientProvider,
  });
}

describe('useLimitedAudioQuizV2', () => {
  beforeEach(() => {
    resetMockUseExampleQuery();
    resetMockAudioAdapter();
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
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      fromLesson: lcspCourse.lessons[0],
      fromLessonNumber: 2,
      toLesson: lcspCourse.lessons[1],
      toLessonNumber: 10,
    });
  });

  it('asks only for examples that carry audio', () => {
    renderLimitedAudioQuiz();

    expect(mockUseExampleQuery).toHaveBeenCalledWith(150, true);
  });

  it('starts on a speaking quiz of twenty with autoplay on', async () => {
    serveExamples(createExamples(150), 412);
    const { result } = renderLimitedAudioQuiz();

    await waitFor(() => expect(result.current.quizLength).toBe(20));

    expect(result.current.audioQuizType).toBe(AudioQuizType.Speaking);
    expect(result.current.autoplay).toBe(true);
    expect(result.current.quizLengthOptions).toEqual([10, 20, 50, 100, 150]);
    expect(result.current.countLabel).toBe('412 audio examples found');
    expect(result.current.ctaLabel).toBe('Quiz 20 audio examples');
  });

  it('drops examples with no Spanish audio from the lengths and the draw', async () => {
    serveExamples(
      createExamples(12, (index) =>
        index < 2 ? '' : 'https://audio.example/clip.mp3',
      ),
    );
    const { result } = renderLimitedAudioQuiz();

    await waitFor(() => expect(result.current.quizLengthOptions).toEqual([10]));

    await act(async () => {
      result.current.readyQuiz();
    });

    const drawn = result.current.audioQuizProps.examplesToQuiz;
    expect(drawn).toHaveLength(10);
    expect(drawn.every((example) => example.spanishAudio.length > 0)).toBe(
      true,
    );
  });

  it('is not ready when nothing matches', async () => {
    serveExamples([]);
    const { result } = renderLimitedAudioQuiz();

    await waitFor(() => expect(result.current.isInitialLoading).toBe(false));

    expect(result.current.quizLengthOptions).toEqual([]);
    expect(result.current.quizLength).toBe(0);
    expect(result.current.quizNotReady).toBe(true);
  });

  it('carries the chosen mode and autoplay into the quiz, which never collects flashcards', async () => {
    serveExamples(createExamples(30));
    const { result } = renderLimitedAudioQuiz();

    await act(async () => {
      result.current.setAudioQuizType(AudioQuizType.Listening);
      result.current.setAutoplay(false);
    });

    expect(result.current.audioQuizProps).toMatchObject({
      audioQuizType: AudioQuizType.Listening,
      autoplay: false,
      ready: false,
      examplesToQuiz: [],
      canCollect: false,
    });
  });

  it('primes audio, draws the chosen length, and records the To lesson on start', async () => {
    serveExamples(createExamples(76));
    const { result } = renderLimitedAudioQuiz();

    await waitFor(() => expect(result.current.quizLength).toBe(20));

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(mockAudioAdapter.primeAudioElement).toHaveBeenCalledWith(silence1s);
    expect(result.current.quizReady).toBe(true);
    expect(result.current.audioQuizProps.examplesToQuiz).toHaveLength(20);
    await waitFor(() =>
      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledWith({
        email: limitedUser.emailAddress,
        courseId: lcspCourse.id,
        lessonNumber: 10,
      }),
    );
  });

  it('goes back to setup when the quiz cleans up', async () => {
    serveExamples(createExamples(30));
    const { result } = renderLimitedAudioQuiz();

    await act(async () => {
      result.current.readyQuiz();
    });
    expect(result.current.quizReady).toBe(true);

    await act(async () => {
      result.current.audioQuizProps.cleanupFunction();
    });

    expect(result.current.quizReady).toBe(false);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
  });

  it('surfaces an example query error', () => {
    overrideMockUseExampleQuery({ error: new Error('boom') });

    const { result } = renderLimitedAudioQuiz();

    expect(result.current.error?.message).toBe('boom');
  });
});
