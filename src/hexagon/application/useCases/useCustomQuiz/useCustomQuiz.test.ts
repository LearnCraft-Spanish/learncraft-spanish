import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockUseExampleQuery,
  overrideMockUseExampleQuery,
  readMockUseExampleQuery,
  resetMockUseExampleQuery,
} from '@application/queries/ExampleQueries/useExampleQuery.mock';
import { useCustomQuiz } from '@application/useCases/useCustomQuiz/useCustomQuiz';
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

function renderCustomQuiz() {
  return renderHook(() => useCustomQuiz(), {
    wrapper: TestQueryClientProvider,
  });
}

function renderLoadedQuiz(
  examples: ExampleWithVocabulary[],
  totalCount: number | null = examples.length,
) {
  serveExamples(examples, totalCount);
  return renderCustomQuiz();
}

function expectExampleQueryCalls(disableCache: boolean) {
  expect(mockUseExampleQuery.mock.calls.length).toBeGreaterThan(0);
  for (const call of mockUseExampleQuery.mock.calls) {
    expect(call).toEqual([150, false, disableCache]);
  }
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

describe('useCustomQuiz', () => {
  beforeEach(() => {
    resetMockUseExampleQuery();
    signIn({ isCoach: false, isAdmin: false });
  });

  it('offers no length and an empty slice while examples are still loading', () => {
    overrideMockUseExampleQuery({
      isLoading: true,
      filteredExamples: null,
      totalCount: null,
    });
    const { result, rerender } = renderCustomQuiz();

    expect(result.current.isLoadingExamples).toBe(true);
    expect(result.current.availableQuizLengths).toEqual([]);
    expect(result.current.safeQuizLength).toBe(0);
    expect(result.current.examplesToQuiz).toEqual([]);
    expect(result.current.totalCount).toBeNull();

    serveExamples(createExamples(20));
    rerender();
    expect(result.current.isLoadingExamples).toBe(false);
    expect(result.current.availableQuizLengths).toEqual([10, 20]);
  });

  it('uses the exact set when nothing reaches the first preset', () => {
    const { result } = renderLoadedQuiz(createExamples(0), 5);

    expect(result.current.availableQuizLengths).toEqual([0]);
    expect(result.current.safeQuizLength).toBe(0);
    expect(result.current.totalCount).toBe(5);

    const eight = renderLoadedQuiz(createExamples(8));
    expect(eight.result.current.availableQuizLengths).toEqual([8]);
    expect(eight.result.current.safeQuizLength).toBe(8);
    eight.unmount();
  });

  it('keeps presets that fit and adds the exact size below 100', () => {
    const { result } = renderLoadedQuiz(createExamples(25), 80);

    expect(result.current.availableQuizLengths).toEqual([10, 20, 25]);
    expect(result.current.totalCount).toBe(80);
  });

  it('does not add a second copy of 100 when the page is exactly that preset', () => {
    const { result } = renderLoadedQuiz(createExamples(100), 250);

    expect(result.current.availableQuizLengths).toEqual([10, 20, 50, 100]);
  });

  it('adds the exact size at 99 and the total count once the page passes 100', () => {
    const under = renderLoadedQuiz(createExamples(99), 250);
    expect(under.result.current.availableQuizLengths).toEqual([10, 20, 50, 99]);
    under.unmount();

    const over = renderLoadedQuiz(createExamples(101), 250);
    expect(over.result.current.availableQuizLengths).toEqual([
      10, 20, 50, 100, 250,
    ]);
    over.unmount();
  });

  it('adds 0 when a page of 100 or more has no total', () => {
    const { result } = renderLoadedQuiz(createExamples(150), null);

    expect(result.current.availableQuizLengths).toEqual([0, 10, 20, 50, 100]);
    expect(result.current.totalCount).toBeNull();
  });

  it('defaults to 20 and clamps a longer choice down to a length that fits', async () => {
    const { result } = renderLoadedQuiz(createExamples(50));

    expect(result.current.availableQuizLengths).toEqual([10, 20, 50]);
    expect(result.current.safeQuizLength).toBe(20);

    await act(async () => {
      result.current.setSelectedQuizLength(10);
    });
    expect(result.current.safeQuizLength).toBe(10);

    await act(async () => {
      result.current.setSelectedQuizLength(15);
    });
    expect(result.current.safeQuizLength).toBe(10);

    await act(async () => {
      result.current.setSelectedQuizLength(20);
    });
    expect(result.current.safeQuizLength).toBe(20);

    await act(async () => {
      result.current.setSelectedQuizLength(49);
    });
    expect(result.current.safeQuizLength).toBe(20);

    await act(async () => {
      result.current.setSelectedQuizLength(50);
    });
    expect(result.current.safeQuizLength).toBe(50);

    await act(async () => {
      result.current.setSelectedQuizLength(100);
    });
    expect(result.current.safeQuizLength).toBe(50);

    await act(async () => {
      result.current.setSelectedQuizLength(0);
    });
    expect(result.current.safeQuizLength).toBe(20);
  });

  it('defaults to the first length at or under 20 when 20 does not fit', async () => {
    const { result } = renderLoadedQuiz(createExamples(15));

    expect(result.current.availableQuizLengths).toEqual([10, 15]);
    expect(result.current.safeQuizLength).toBe(10);

    await act(async () => {
      result.current.setSelectedQuizLength(15);
    });
    expect(result.current.safeQuizLength).toBe(15);

    await act(async () => {
      result.current.setSelectedQuizLength(9);
    });
    expect(result.current.safeQuizLength).toBe(10);
  });

  it('quizzes a shuffled slice of the safe length, including examples without audio', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const examples = createExamples(25, (index) =>
      index === 24 ? '' : 'https://audio.example/clip.mp3',
    );
    const { result } = renderLoadedQuiz(examples);

    expect(result.current.safeQuizLength).toBe(20);
    expect(result.current.examplesToQuiz).toEqual(
      fisherYatesShuffle(examples).slice(0, 20),
    );
    expect(result.current.examplesToQuiz).not.toEqual(examples.slice(0, 20));

    await act(async () => {
      result.current.setSelectedQuizLength(10);
    });

    expect(result.current.examplesToQuiz).toEqual(
      fisherYatesShuffle(examples).slice(0, 10),
    );
  });

  it('starts the quiz without loading a larger page at 150, and does above it', async () => {
    const atBoundary = renderLoadedQuiz(createExamples(150), 150);
    await act(async () => {
      atBoundary.result.current.setSelectedQuizLength(150);
    });
    expect(atBoundary.result.current.safeQuizLength).toBe(150);
    vi.mocked(readMockUseExampleQuery().updatePageSize).mockClear();

    await act(async () => {
      atBoundary.result.current.startCustomQuiz();
    });

    expect(atBoundary.result.current.customQuizReady).toBe(true);
    expect(
      vi.mocked(readMockUseExampleQuery().updatePageSize),
    ).not.toHaveBeenCalled();
    atBoundary.unmount();

    const aboveBoundary = renderLoadedQuiz(createExamples(151), 151);
    await act(async () => {
      aboveBoundary.result.current.setSelectedQuizLength(151);
    });
    expect(aboveBoundary.result.current.safeQuizLength).toBe(151);
    vi.mocked(readMockUseExampleQuery().updatePageSize).mockClear();

    await act(async () => {
      aboveBoundary.result.current.startCustomQuiz();
    });

    expect(aboveBoundary.result.current.customQuizReady).toBe(true);
    expect(
      vi.mocked(readMockUseExampleQuery().updatePageSize),
    ).toHaveBeenCalledTimes(1);
    expect(
      vi.mocked(readMockUseExampleQuery().updatePageSize),
    ).toHaveBeenCalledWith(151);
    aboveBoundary.unmount();
  });

  it('marks an empty quiz ready without changing the page size', async () => {
    const { result } = renderLoadedQuiz(createExamples(0), 0);
    vi.mocked(readMockUseExampleQuery().updatePageSize).mockClear();

    await act(async () => {
      result.current.startCustomQuiz();
    });

    expect(result.current.safeQuizLength).toBe(0);
    expect(result.current.customQuizReady).toBe(true);
    expect(
      vi.mocked(readMockUseExampleQuery().updatePageSize),
    ).not.toHaveBeenCalled();
  });

  it('loads a page of 150 without requiring audio, and skips the cache for staff', () => {
    const student = renderLoadedQuiz(createExamples(20));
    expectExampleQueryCalls(false);
    student.unmount();

    mockUseExampleQuery.mockClear();
    signIn({ isCoach: true, isAdmin: false });
    const coach = renderLoadedQuiz(createExamples(20));
    expectExampleQueryCalls(true);
    coach.unmount();

    mockUseExampleQuery.mockClear();
    signIn({ isCoach: false, isAdmin: true });
    const admin = renderLoadedQuiz(createExamples(20));
    expectExampleQueryCalls(true);
    admin.unmount();
  });

  it('keeps the quiz type, Spanish-first, and preset toggles the learner sets', async () => {
    const { result } = renderCustomQuiz();

    expect(result.current.customQuizType).toBe('custom-filters');
    expect(result.current.startWithSpanish).toBe(false);
    expect(result.current.customQuizReady).toBe(false);
    expect(result.current.presetQuizReady).toBe(false);
    expect(result.current.filterState.excludeSpanglish).toBe(false);
    expect(typeof result.current.filterState.removeSkillTagFromFilters).toBe(
      'function',
    );

    await act(async () => {
      result.current.setCustomQuizType('pre-set-quizzes');
      result.current.setStartWithSpanish(true);
      result.current.setPresetQuizReady(true);
      result.current.setCustomQuizReady(true);
    });

    expect(result.current.customQuizType).toBe('pre-set-quizzes');
    expect(result.current.startWithSpanish).toBe(true);
    expect(result.current.presetQuizReady).toBe(true);
    expect(result.current.customQuizReady).toBe(true);

    await act(async () => {
      result.current.setCustomQuizReady(false);
    });
    expect(result.current.customQuizReady).toBe(false);
  });
});
