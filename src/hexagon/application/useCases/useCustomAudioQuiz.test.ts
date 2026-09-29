import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { useCustomAudioQuiz } from '@application/useCases/useCustomAudioQuiz';
import { AudioQuizType } from '@domain/audioQuizzing';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

function withAudio(examples: ExampleWithVocabulary[]): ExampleWithVocabulary[] {
  return examples.filter((example) => example.spanishAudio?.length > 0);
}

function signIn({ isCoach, isAdmin }: { isCoach: boolean; isAdmin: boolean }) {
  overrideAuthAndAppUser({
    authUser: getAuthUserFromEmail(
      isCoach || isAdmin
        ? 'student-admin@fake.not'
        : 'student-no-flashcards@fake.not',
    )!,
    isAuthenticated: true,
    isStudent: !isCoach && !isAdmin,
    isCoach,
    isAdmin,
    isLimited: false,
  });
}

function renderAudioQuiz() {
  return renderHook(() => useCustomAudioQuiz(), {
    wrapper: TestQueryClientProvider,
  });
}

describe('useCustomAudioQuiz', () => {
  beforeEach(() => {
    signIn({ isCoach: false, isAdmin: false });
  });

  it('loads an audio-required page of 150 and pages it in batches of 25', async () => {
    const examples = createExamples(10);
    const calls: Array<{ page: number; limit: number; audioOnly?: boolean }> =
      [];
    let callCount = 0;
    let release: (value: {
      examples: ExampleWithVocabulary[];
      totalCount: number;
    }) => void = () => {};

    overrideMockExampleAdapter({
      getFilteredExamples: (params) => {
        calls.push({
          page: params.page,
          limit: params.limit,
          audioOnly: params.audioOnly,
        });
        callCount += 1;
        if (callCount === 1) {
          return new Promise((resolve) => {
            release = resolve;
          });
        }
        return Promise.resolve({ examples, totalCount: 300 });
      },
    });

    const { result } = renderAudioQuiz();

    await waitFor(() => expect(result.current.isLoadingExamples).toBe(true));
    expect(result.current.pagination.pageSize).toBe(25);
    expect(result.current.pagination.pagesPerQuery).toBe(6);
    expect(result.current.pagination.queryPage).toBe(1);
    expect(result.current.pagination.maxPageNumber).toBe(0);
    expect(result.current.pagination.maxPageName).toBe('many');
    expect(result.current.audioQuizSetup.totalExamples).toBe(0);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
    expect(result.current.quizReady).toBe(false);

    release({ examples, totalCount: 300 });

    await waitFor(() => expect(result.current.isLoadingExamples).toBe(false));
    expect(result.current.totalCount).toBe(300);
    expect(result.current.pagination.pageSize).toBe(25);
    expect(result.current.pagination.pagesPerQuery).toBe(6);
    expect(result.current.pagination.maxPageNumber).toBe(12);
    expect(result.current.pagination.maxPageName).toBe('12');
    expect(calls[0]).toEqual({ page: 1, limit: 150, audioOnly: true });

    await act(async () => {
      result.current.pagination.goToPage(6);
    });
    expect(result.current.pagination.page).toBe(6);
    expect(result.current.pagination.queryPage).toBe(1);
    expect(calls.some((call) => call.page === 2)).toBe(false);

    await act(async () => {
      result.current.pagination.goToPage(7);
    });
    await waitFor(() => expect(result.current.pagination.queryPage).toBe(2));
    expect(result.current.pagination.page).toBe(7);
    expect(calls).toContainEqual({ page: 2, limit: 150, audioOnly: true });
  });

  it('asks the example query for audio and disables the cache only for staff', async () => {
    const calls: Array<{
      audioOnly?: boolean;
      limit: number;
      disableCache?: boolean;
      page: number;
    }> = [];
    overrideMockExampleAdapter({
      getFilteredExamples: async (params) => {
        calls.push(params);
        return { examples: createExamples(4), totalCount: 4 };
      },
    });

    const student = renderAudioQuiz();
    await waitFor(() => expect(student.result.current.totalCount).toBe(4));
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      expect(call.audioOnly).toBe(true);
      expect(call.limit).toBe(150);
      expect(call.disableCache).toBe(false);
      expect(call.page).toBe(1);
    }
    student.unmount();

    calls.length = 0;
    signIn({ isCoach: true, isAdmin: false });
    const coach = renderAudioQuiz();
    await waitFor(() => expect(coach.result.current.totalCount).toBe(4));
    for (const call of calls) {
      expect(call.audioOnly).toBe(true);
      expect(call.limit).toBe(150);
      expect(call.disableCache).toBe(true);
    }
    coach.unmount();

    calls.length = 0;
    signIn({ isCoach: false, isAdmin: true });
    const admin = renderAudioQuiz();
    await waitFor(() => expect(admin.result.current.totalCount).toBe(4));
    for (const call of calls) {
      expect(call.disableCache).toBe(true);
      expect(call.audioOnly).toBe(true);
    }
    admin.unmount();
  });

  it('hands the audio-only examples to setup and quizzes a shuffled slice of that length', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const examples = createExamples(15, (index) =>
      index < 12 ? 'https://audio.example/clip.mp3' : '',
    );
    const audible = withAudio(examples);
    overrideMockExampleAdapter({
      getFilteredExamples: async () => ({
        examples,
        totalCount: examples.length,
      }),
    });

    const { result } = renderAudioQuiz();
    await waitFor(() => expect(result.current.totalCount).toBe(15));

    expect(result.current.audioQuizSetup.totalExamples).toBe(12);
    expect(result.current.audioQuizSetup.availableQuizLengths).toEqual([
      10, 12,
    ]);
    expect(result.current.audioQuizSetup.selectedQuizLength).toBe(10);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual(
      fisherYatesShuffle(audible).slice(0, 10),
    );
    expect(
      result.current.audioQuizProps.examplesToQuiz.every(
        (example) => example.spanishAudio.length > 0,
      ),
    ).toBe(true);
    expect(result.current.audioQuizProps.audioQuizType).toBe(
      AudioQuizType.Speaking,
    );
    expect(result.current.audioQuizProps.autoplay).toBe(true);
    expect(result.current.audioQuizProps.ready).toBe(false);

    await act(async () => {
      result.current.audioQuizSetup.setSelectedQuizLength(12);
      result.current.audioQuizSetup.setAudioQuizType(AudioQuizType.Listening);
      result.current.audioQuizSetup.setAutoplay(false);
    });

    expect(result.current.audioQuizSetup.selectedQuizLength).toBe(12);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual(
      fisherYatesShuffle(audible).slice(0, 12),
    );
    expect(result.current.audioQuizProps.audioQuizType).toBe(
      AudioQuizType.Listening,
    );
    expect(result.current.audioQuizProps.autoplay).toBe(false);

    await act(async () => {
      result.current.setQuizReady(true);
    });
    expect(result.current.quizReady).toBe(true);
    expect(result.current.audioQuizProps.ready).toBe(true);

    await act(async () => {
      result.current.audioQuizProps.cleanupFunction();
    });
    expect(result.current.quizReady).toBe(false);
    expect(result.current.audioQuizProps.ready).toBe(false);
  });

  it('surfaces an example load failure', async () => {
    overrideMockExampleAdapter({
      getFilteredExamples: async () => {
        throw new Error('examples failed');
      },
    });

    const { result } = renderAudioQuiz();

    await waitFor(() =>
      expect(result.current.errorExamples).toBeInstanceOf(Error),
    );
    expect(result.current.errorExamples?.message).toBe('examples failed');
    expect(result.current.isLoadingExamples).toBe(false);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
  });
});
