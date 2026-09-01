import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { mockLastStudiedLessonAdapter } from '@application/adapters/lastStudiedLessonAdapter.mock';
import { overrideMockSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import {
  CustomQuizType,
  useCustomQuizV2,
} from '@application/useCases/useCustomQuizV2';
import { AudioQuizType } from '@domain/audioQuizzing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/audioAdapter', () => ({
  useAudioAdapter: () => ({ primeAudioElement: vi.fn<() => void>() }),
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
  overrideMockExampleAdapter({
    getFilteredExamples: async () => ({
      examples: createMockExampleWithVocabularyList(available),
      totalCount: total,
    }),
  });
}

describe('useCustomQuizV2', () => {
  beforeEach(() => {
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
});
