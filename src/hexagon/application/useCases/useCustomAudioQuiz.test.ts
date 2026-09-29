import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockUseExampleQuery,
  overrideMockUseExampleQuery,
  resetMockUseExampleQuery,
} from '@application/queries/ExampleQueries/useExampleQuery.mock';
import { useCustomAudioQuiz } from '@application/useCases/useCustomAudioQuiz';
import { AudioQuizType } from '@domain/audioQuizzing';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { act, renderHook } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/queries/ExampleQueries/useExampleQuery', () => ({
  useExampleQuery: mockUseExampleQuery,
}));

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

function expectAudioQueryCalls(disableCache: boolean) {
  expect(mockUseExampleQuery.mock.calls.length).toBeGreaterThan(0);
  for (const call of mockUseExampleQuery.mock.calls) {
    expect(call).toEqual([150, true, disableCache]);
  }
}

describe('useCustomAudioQuiz', () => {
  beforeEach(() => {
    resetMockUseExampleQuery();
    signIn({ isCoach: false, isAdmin: false });
  });

  it('loads an audio-required page of 150 and pages it in batches of 25', async () => {
    const examples = createExamples(10);
    const changeQueryPage = vi.fn<(page: number) => void>();
    changeQueryPage.mockImplementation((page: number) => {
      overrideMockUseExampleQuery({ page });
    });
    overrideMockUseExampleQuery({
      isLoading: true,
      filteredExamples: null,
      totalCount: null,
      page: 1,
      changeQueryPage,
    });

    const { result, rerender } = renderAudioQuiz();

    expect(result.current.isLoadingExamples).toBe(true);
    expect(result.current.pagination.pageSize).toBe(25);
    expect(result.current.pagination.pagesPerQuery).toBe(6);
    expect(result.current.pagination.queryPage).toBe(1);
    expect(result.current.pagination.maxPageNumber).toBe(0);
    expect(result.current.pagination.maxPageName).toBe('many');
    expect(result.current.audioQuizSetup.totalExamples).toBe(0);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
    expect(result.current.quizReady).toBe(false);
    expectAudioQueryCalls(false);

    overrideMockUseExampleQuery({
      isLoading: false,
      filteredExamples: examples,
      totalCount: 300,
      page: 1,
    });
    rerender();

    expect(result.current.totalCount).toBe(300);
    expect(result.current.pagination.pageSize).toBe(25);
    expect(result.current.pagination.pagesPerQuery).toBe(6);
    expect(result.current.pagination.maxPageNumber).toBe(12);
    expect(result.current.pagination.maxPageName).toBe('12');

    await act(async () => {
      result.current.pagination.goToPage(6);
    });
    expect(result.current.pagination.page).toBe(6);
    expect(result.current.pagination.queryPage).toBe(1);
    expect(changeQueryPage).toHaveBeenCalledWith(1);
    expect(changeQueryPage).not.toHaveBeenCalledWith(2);

    await act(async () => {
      result.current.pagination.goToPage(7);
    });
    expect(result.current.pagination.page).toBe(7);
    expect(result.current.pagination.queryPage).toBe(2);
    expect(changeQueryPage).toHaveBeenCalledWith(2);
  });

  it('asks the example query for audio and disables the cache only for staff', () => {
    overrideMockUseExampleQuery({
      filteredExamples: createExamples(4),
      totalCount: 4,
      isLoading: false,
    });

    const student = renderAudioQuiz();
    expect(student.result.current.totalCount).toBe(4);
    expectAudioQueryCalls(false);
    student.unmount();

    mockUseExampleQuery.mockClear();
    signIn({ isCoach: true, isAdmin: false });
    const coach = renderAudioQuiz();
    expect(coach.result.current.totalCount).toBe(4);
    expectAudioQueryCalls(true);
    coach.unmount();

    mockUseExampleQuery.mockClear();
    signIn({ isCoach: false, isAdmin: true });
    const admin = renderAudioQuiz();
    expect(admin.result.current.totalCount).toBe(4);
    expectAudioQueryCalls(true);
    admin.unmount();
  });

  it('hands the audio-only examples to setup and quizzes a shuffled slice of that length', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const examples = createExamples(15, (index) =>
      index < 12 ? 'https://audio.example/clip.mp3' : '',
    );
    const audible = withAudio(examples);
    overrideMockUseExampleQuery({
      filteredExamples: examples,
      totalCount: examples.length,
      isLoading: false,
    });

    const { result } = renderAudioQuiz();

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

  it('surfaces an example load failure', () => {
    overrideMockUseExampleQuery({
      isLoading: false,
      filteredExamples: null,
      totalCount: null,
      error: new Error('examples failed'),
    });

    const { result } = renderAudioQuiz();

    expect(result.current.errorExamples?.message).toBe('examples failed');
    expect(result.current.isLoadingExamples).toBe(false);
    expect(result.current.audioQuizProps.examplesToQuiz).toEqual([]);
  });
});
