import type { UseExampleQueryReturnType } from '@application/queries/ExampleQueries/useExampleQuery';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { useCustomQuiz } from '@application/useCases/useCustomQuiz/useCustomQuiz';
import { fisherYatesShuffle } from '@domain/functions/fisherYatesShuffle';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  totalCount: number | null = examples.length,
) {
  overrideMockExampleAdapter({
    getFilteredExamples: async () => {
      return {
        examples,
        totalCount,
      } as { examples: ExampleWithVocabulary[]; totalCount: number };
    },
  });
}

function renderCustomQuiz() {
  return renderHook(() => useCustomQuiz(), {
    wrapper: TestQueryClientProvider,
  });
}

async function renderLoadedQuiz(
  examples: ExampleWithVocabulary[],
  totalCount: number | null = examples.length,
) {
  serveExamples(examples, totalCount);
  const view = renderCustomQuiz();
  if (totalCount === null) {
    await waitFor(() =>
      expect(view.result.current.availableQuizLengths).toContain(10),
    );
  } else {
    await waitFor(() =>
      expect(view.result.current.totalCount).toBe(totalCount),
    );
  }
  return view;
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
    exampleQueryCalls.length = 0;
    updatePageSizeSpy.mockClear();
    signIn({ isCoach: false, isAdmin: false });
  });

  it('offers no length and an empty slice while examples are still loading', async () => {
    let release: (value: {
      examples: ExampleWithVocabulary[];
      totalCount: number;
    }) => void = () => {};
    overrideMockExampleAdapter({
      getFilteredExamples: () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    });

    const { result } = renderCustomQuiz();

    await waitFor(() => expect(result.current.isLoadingExamples).toBe(true));
    expect(result.current.availableQuizLengths).toEqual([]);
    expect(result.current.safeQuizLength).toBe(0);
    expect(result.current.examplesToQuiz).toEqual([]);
    expect(result.current.totalCount).toBeNull();

    release({ examples: createExamples(20), totalCount: 20 });
    await waitFor(() => expect(result.current.isLoadingExamples).toBe(false));
  });

  it('uses the exact set when nothing reaches the first preset', async () => {
    const { result } = await renderLoadedQuiz(createExamples(0), 5);

    expect(result.current.availableQuizLengths).toEqual([0]);
    expect(result.current.safeQuizLength).toBe(0);
    expect(result.current.totalCount).toBe(5);

    const eight = await renderLoadedQuiz(createExamples(8));
    expect(eight.result.current.availableQuizLengths).toEqual([8]);
    expect(eight.result.current.safeQuizLength).toBe(8);
    eight.unmount();
  });

  it('keeps presets that fit and adds the exact size below 100', async () => {
    const { result } = await renderLoadedQuiz(createExamples(25), 80);

    expect(result.current.availableQuizLengths).toEqual([10, 20, 25]);
    expect(result.current.totalCount).toBe(80);
  });

  it('does not add a second copy of 100 when the page is exactly that preset', async () => {
    const { result } = await renderLoadedQuiz(createExamples(100), 250);

    expect(result.current.availableQuizLengths).toEqual([10, 20, 50, 100]);
  });

  it('adds the exact size at 99 and the total count once the page passes 100', async () => {
    const under = await renderLoadedQuiz(createExamples(99), 250);
    expect(under.result.current.availableQuizLengths).toEqual([10, 20, 50, 99]);
    under.unmount();

    const over = await renderLoadedQuiz(createExamples(101), 250);
    expect(over.result.current.availableQuizLengths).toEqual([
      10, 20, 50, 100, 250,
    ]);
    over.unmount();
  });

  it('adds 0 when a page of 100 or more has no total', async () => {
    const { result } = await renderLoadedQuiz(createExamples(150), null);

    expect(result.current.availableQuizLengths).toEqual([0, 10, 20, 50, 100]);
    expect(result.current.totalCount).toBeNull();
  });

  it('defaults to 20 and clamps a longer choice down to a length that fits', async () => {
    const { result } = await renderLoadedQuiz(createExamples(50));

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
    const { result } = await renderLoadedQuiz(createExamples(15));

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
    const { result } = await renderLoadedQuiz(examples);

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
    const atBoundary = await renderLoadedQuiz(createExamples(150), 150);
    await act(async () => {
      atBoundary.result.current.setSelectedQuizLength(150);
    });
    expect(atBoundary.result.current.safeQuizLength).toBe(150);
    updatePageSizeSpy.mockClear();

    await act(async () => {
      atBoundary.result.current.startCustomQuiz();
    });

    expect(atBoundary.result.current.customQuizReady).toBe(true);
    expect(updatePageSizeSpy).not.toHaveBeenCalled();
    atBoundary.unmount();

    const aboveBoundary = await renderLoadedQuiz(createExamples(151), 151);
    await act(async () => {
      aboveBoundary.result.current.setSelectedQuizLength(151);
    });
    expect(aboveBoundary.result.current.safeQuizLength).toBe(151);
    updatePageSizeSpy.mockClear();

    await act(async () => {
      aboveBoundary.result.current.startCustomQuiz();
    });

    expect(aboveBoundary.result.current.customQuizReady).toBe(true);
    expect(updatePageSizeSpy).toHaveBeenCalledTimes(1);
    expect(updatePageSizeSpy).toHaveBeenCalledWith(151);
    aboveBoundary.unmount();
  });

  it('marks an empty quiz ready without changing the page size', async () => {
    const { result } = await renderLoadedQuiz(createExamples(0), 0);
    updatePageSizeSpy.mockClear();

    await act(async () => {
      result.current.startCustomQuiz();
    });

    expect(result.current.safeQuizLength).toBe(0);
    expect(result.current.customQuizReady).toBe(true);
    expect(updatePageSizeSpy).not.toHaveBeenCalled();
  });

  it('loads a page of 150 without requiring audio, and skips the cache for staff', async () => {
    const student = await renderLoadedQuiz(createExamples(20));
    expect(exampleQueryCalls.length).toBeGreaterThan(0);
    for (const call of exampleQueryCalls) {
      expect(call).toEqual({
        pageSize: 150,
        audioRequired: false,
        disableCache: false,
      });
    }
    student.unmount();

    exampleQueryCalls.length = 0;
    signIn({ isCoach: true, isAdmin: false });
    const coach = await renderLoadedQuiz(createExamples(20));
    for (const call of exampleQueryCalls) {
      expect(call).toEqual({
        pageSize: 150,
        audioRequired: false,
        disableCache: true,
      });
    }
    coach.unmount();

    exampleQueryCalls.length = 0;
    signIn({ isCoach: false, isAdmin: true });
    const admin = await renderLoadedQuiz(createExamples(20));
    for (const call of exampleQueryCalls) {
      expect(call).toEqual({
        pageSize: 150,
        audioRequired: false,
        disableCache: true,
      });
    }
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
