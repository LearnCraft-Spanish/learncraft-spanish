import type { Flashcard } from '@learncraft-spanish/shared';
import {
  mockUseFlashcardsQuery,
  overrideMockUseFlashcardsQuery,
  resetMockUseFlashcardsQuery,
} from '@application/queries/useFlashcardsQuery.mock';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { renderHook } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The hexagon setup mocks this hook for every other test. This file needs the
// real derivation, with useFlashcardsQuery mocked underneath it.
vi.mock('@application/units/useStudentFlashcards', async () =>
  vi.importActual('@application/units/useStudentFlashcards'),
);

vi.mock('@application/queries/useFlashcardsQuery', () => ({
  useFlashcardsQuery: () => mockUseFlashcardsQuery,
}));

const REVIEWED_ON = '2026-06-15';

function makeFlashcard({
  id,
  exampleId,
  custom = false,
  nextReview,
  spanishAudio = '',
  englishAudio = '',
  interval = 1,
}: {
  id: number;
  exampleId: number;
  custom?: boolean;
  nextReview: string;
  spanishAudio?: string;
  englishAudio?: string;
  interval?: number | null;
}): Flashcard {
  const card = createMockFlashcard({
    id,
    custom,
    nextReview,
    interval,
    userId: 42,
  });
  return {
    ...card,
    id,
    custom,
    nextReview,
    interval,
    userId: 42,
    example: {
      ...card.example,
      id: exampleId,
      spanishAudio,
      englishAudio,
    },
  };
}

function sampleDeck() {
  const dueCustomAudio = makeFlashcard({
    id: 1,
    exampleId: 11,
    custom: true,
    nextReview: '2000-01-01',
    spanishAudio: 'https://audio.example/due.mp3',
  });
  const duePlain = makeFlashcard({
    id: 2,
    exampleId: 12,
    custom: false,
    nextReview: '2000-01-02',
    englishAudio: 'https://audio.example/english-only.mp3',
  });
  const laterCustom = makeFlashcard({
    id: 3,
    exampleId: 13,
    custom: true,
    nextReview: '2099-01-01',
  });
  const undatedAudio = makeFlashcard({
    id: 4,
    exampleId: 14,
    custom: false,
    nextReview: '',
    spanishAudio: 'https://audio.example/undated.mp3',
  });
  const adding = makeFlashcard({
    id: -5,
    exampleId: 15,
    custom: false,
    nextReview: '2099-06-01',
  });
  const notAdding = makeFlashcard({
    id: 0,
    exampleId: 16,
    custom: false,
    nextReview: '2099-06-02',
  });

  return {
    dueCustomAudio,
    duePlain,
    laterCustom,
    undatedAudio,
    adding,
    notAdding,
    flashcards: [
      dueCustomAudio,
      duePlain,
      laterCustom,
      undatedAudio,
      adding,
      notAdding,
    ],
  };
}

function renderStudentFlashcards() {
  return renderHook(() => useStudentFlashcards());
}

describe('useStudentFlashcards', () => {
  beforeEach(() => {
    resetMockUseFlashcardsQuery();
    vi.spyOn(Math, 'random').mockReturnValue(0.999999999);
  });

  it('passes through the query list, status, and write functions', () => {
    const error = new Error('still loading');
    const deck = sampleDeck();
    overrideMockUseFlashcardsQuery({
      flashcards: deck.flashcards,
      isLoading: true,
      error,
      pendingDeleteExampleIds: [14],
    });

    const { result } = renderStudentFlashcards();

    expect(result.current.flashcards).toBe(deck.flashcards);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.createFlashcards).toBe(
      mockUseFlashcardsQuery.createFlashcards,
    );
    expect(result.current.deleteFlashcards).toBe(
      mockUseFlashcardsQuery.deleteFlashcards,
    );
    expect(result.current.updateFlashcards).toBe(
      mockUseFlashcardsQuery.updateFlashcards,
    );
  });

  it('keeps every derived list empty until flashcards have loaded', () => {
    overrideMockUseFlashcardsQuery({
      flashcards: undefined,
      pendingDeleteExampleIds: undefined,
    });

    const { result } = renderStudentFlashcards();

    expect(result.current.flashcardsDueForReview).toBeUndefined();
    expect(result.current.customFlashcards).toBeUndefined();
    expect(result.current.customFlashcardsDueForReview).toBeUndefined();
    expect(result.current.audioFlashcards).toBeUndefined();
    expect(result.current.collectedExamples).toBeUndefined();
    expect(result.current.isExampleCollected({ exampleId: 11 })).toBe(false);
    expect(result.current.isFlashcardCollected({ flashcardId: 1 })).toBe(false);
    expect(result.current.isCustomFlashcard({ exampleId: 11 })).toBe(false);
    expect(result.current.isAddingFlashcard({ exampleId: 15 })).toBe(false);
    expect(result.current.isRemovingFlashcard({ exampleId: 14 })).toBe(false);
    expect(result.current.isPendingFlashcard({ exampleId: 15 })).toBe(false);
    expect(result.current.getFlashcardByExampleId({ exampleId: 11 })).toBe(
      undefined,
    );
    expect(
      result.current.getRandomFlashcards({
        count: 3,
        audioOnly: true,
        customOnly: true,
        dueForReviewOnly: true,
      }),
    ).toEqual([]);
  });

  it('collects due cards whose review date has arrived, including cards with no date', () => {
    const deck = sampleDeck();
    overrideMockUseFlashcardsQuery({ flashcards: deck.flashcards });

    const { result } = renderStudentFlashcards();

    expect(result.current.flashcardsDueForReview).toEqual([
      deck.dueCustomAudio,
      deck.duePlain,
      deck.undatedAudio,
    ]);
  });

  it('treats a review timestamp equal to now as due', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T15:04:00.000Z'));
    const dueNow = makeFlashcard({
      id: 8,
      exampleId: 18,
      nextReview: '2026-06-15T15:04:00.000Z',
    });
    const dueLaterToday = makeFlashcard({
      id: 9,
      exampleId: 19,
      nextReview: '2026-06-15T15:04:00.001Z',
    });
    overrideMockUseFlashcardsQuery({
      flashcards: [dueLaterToday, dueNow],
    });

    try {
      const { result } = renderStudentFlashcards();

      expect(result.current.flashcardsDueForReview).toEqual([dueNow]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('collects custom cards, and custom cards that are also due', () => {
    const deck = sampleDeck();
    overrideMockUseFlashcardsQuery({ flashcards: deck.flashcards });

    const { result } = renderStudentFlashcards();

    expect(result.current.customFlashcards).toEqual([
      deck.dueCustomAudio,
      deck.laterCustom,
    ]);
    expect(result.current.customFlashcardsDueForReview).toEqual([
      deck.dueCustomAudio,
    ]);
    expect(
      result.current.isCustomFlashcard({
        exampleId: deck.dueCustomAudio.example.id,
      }),
    ).toBe(true);
    expect(
      result.current.isCustomFlashcard({ exampleId: deck.duePlain.example.id }),
    ).toBe(false);
  });

  it('collects cards that have Spanish audio', () => {
    const deck = sampleDeck();
    overrideMockUseFlashcardsQuery({ flashcards: deck.flashcards });

    const { result } = renderStudentFlashcards();

    expect(result.current.audioFlashcards).toEqual([
      deck.dueCustomAudio,
      deck.undatedAudio,
    ]);
  });

  it('collects the examples on the loaded cards, in that order', () => {
    const deck = sampleDeck();
    overrideMockUseFlashcardsQuery({ flashcards: deck.flashcards });

    const { result } = renderStudentFlashcards();

    expect(result.current.collectedExamples).toEqual(
      deck.flashcards.map((card) => card.example),
    );
    expect(
      result.current.isExampleCollected({
        exampleId: deck.laterCustom.example.id,
      }),
    ).toBe(true);
    expect(result.current.isExampleCollected({ exampleId: 999 })).toBe(false);
    expect(
      result.current.isFlashcardCollected({
        flashcardId: deck.duePlain.id,
      }),
    ).toBe(true);
    expect(
      result.current.isFlashcardCollected({
        flashcardId: deck.duePlain.example.id,
      }),
    ).toBe(false);
    expect(
      result.current.getFlashcardByExampleId({
        exampleId: deck.laterCustom.example.id,
      }),
    ).toBe(deck.laterCustom);
    expect(result.current.getFlashcardByExampleId({ exampleId: 999 })).toBe(
      undefined,
    );
  });

  it('draws a random slice from the list each flag selects', () => {
    const deck = sampleDeck();
    overrideMockUseFlashcardsQuery({ flashcards: deck.flashcards });

    const { result } = renderStudentFlashcards();

    expect(
      result.current.getRandomFlashcards({
        count: 1,
        audioOnly: true,
        customOnly: true,
        dueForReviewOnly: true,
      }),
    ).toEqual([deck.dueCustomAudio]);
    expect(
      result.current.getRandomFlashcards({
        count: 2,
        customOnly: true,
        dueForReviewOnly: true,
      }),
    ).toEqual([deck.dueCustomAudio]);
    expect(
      result.current.getRandomFlashcards({ count: 5, customOnly: true }),
    ).toEqual([deck.dueCustomAudio, deck.laterCustom]);
    expect(
      result.current.getRandomFlashcards({ count: 2, dueForReviewOnly: true }),
    ).toEqual([deck.dueCustomAudio, deck.duePlain]);
    expect(result.current.getRandomFlashcards({ count: 2 })).toEqual([
      deck.dueCustomAudio,
      deck.duePlain,
    ]);
  });

  describe('pending adds and deletes', () => {
    it('treats a negative id as an add in progress', () => {
      const deck = sampleDeck();
      overrideMockUseFlashcardsQuery({
        flashcards: deck.flashcards,
        pendingDeleteExampleIds: [],
      });

      const { result } = renderStudentFlashcards();

      expect(
        result.current.isAddingFlashcard({
          exampleId: deck.adding.example.id,
        }),
      ).toBe(true);
      expect(
        result.current.isAddingFlashcard({
          exampleId: deck.notAdding.example.id,
        }),
      ).toBe(false);
      expect(
        result.current.isRemovingFlashcard({
          exampleId: deck.adding.example.id,
        }),
      ).toBe(false);
      expect(
        result.current.isPendingFlashcard({
          exampleId: deck.adding.example.id,
        }),
      ).toBe(true);
    });

    it('treats a pending-delete example id as a remove, even after the card is gone', () => {
      const deck = sampleDeck();
      const remaining = deck.flashcards.filter(
        (card) => card.example.id !== deck.duePlain.example.id,
      );
      overrideMockUseFlashcardsQuery({
        flashcards: remaining,
        pendingDeleteExampleIds: [deck.duePlain.example.id],
      });

      const { result } = renderStudentFlashcards();

      expect(
        result.current.isRemovingFlashcard({
          exampleId: deck.duePlain.example.id,
        }),
      ).toBe(true);
      expect(
        result.current.isExampleCollected({
          exampleId: deck.duePlain.example.id,
        }),
      ).toBe(false);
      expect(
        result.current.isAddingFlashcard({
          exampleId: deck.duePlain.example.id,
        }),
      ).toBe(false);
      expect(
        result.current.isPendingFlashcard({
          exampleId: deck.duePlain.example.id,
        }),
      ).toBe(true);
      expect(
        result.current.isPendingFlashcard({
          exampleId: deck.laterCustom.example.id,
        }),
      ).toBe(false);
    });
  });

  describe('updateFlashcardInterval', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(`${REVIEWED_ON}T15:04:00.000Z`));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('raises, lowers, or keeps the interval and sends that review', async () => {
      const target = makeFlashcard({
        id: 100,
        exampleId: 200,
        nextReview: '2000-01-01',
        interval: 4,
      });
      const other = makeFlashcard({
        id: 101,
        exampleId: 201,
        nextReview: '2000-01-01',
        interval: 9,
      });
      overrideMockUseFlashcardsQuery({ flashcards: [other, target] });

      const { result, rerender } = renderStudentFlashcards();

      await expect(
        result.current.updateFlashcardInterval(target.example.id, 'easy'),
      ).resolves.toBe(5);
      expect(mockUseFlashcardsQuery.updateFlashcards).toHaveBeenCalledWith([
        {
          flashcardId: target.id,
          interval: 5,
          lastReviewedDate: REVIEWED_ON,
        },
      ]);

      await expect(
        result.current.updateFlashcardInterval(target.example.id, 'hard'),
      ).resolves.toBe(3);
      await expect(
        result.current.updateFlashcardInterval(target.example.id, 'viewed'),
      ).resolves.toBe(4);

      overrideMockUseFlashcardsQuery({
        flashcards: [{ ...target, interval: 0 }, other],
      });
      rerender();
      await expect(
        result.current.updateFlashcardInterval(target.example.id, 'hard'),
      ).resolves.toBe(0);

      overrideMockUseFlashcardsQuery({
        flashcards: [{ ...target, interval: null }, other],
      });
      rerender();
      await expect(
        result.current.updateFlashcardInterval(target.example.id, 'easy'),
      ).resolves.toBe(1);
      await expect(
        result.current.updateFlashcardInterval(target.example.id, 'hard'),
      ).resolves.toBe(0);
    });

    it('refuses to update an example that is not collected', async () => {
      overrideMockUseFlashcardsQuery({
        flashcards: [
          makeFlashcard({
            id: 100,
            exampleId: 200,
            nextReview: '2000-01-01',
          }),
        ],
      });

      const { result } = renderStudentFlashcards();

      await expect(
        result.current.updateFlashcardInterval(999, 'easy'),
      ).rejects.toThrow('Flashcard not found for example ID: 999');
      expect(mockUseFlashcardsQuery.updateFlashcards).not.toHaveBeenCalled();
    });
  });
});
