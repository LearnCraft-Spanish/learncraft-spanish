import type { SrsDifficulty } from '@domain/srs';

export interface SrsTallies {
  hard: number;
  easy: number;
}

/**
 * Running counts of what the student has graded during an SRS quiz. Takes the
 * minimal shape of a pending review rather than the application's
 * `PendingFlashcardUpdateObject`, since domain cannot depend on application.
 *
 * A `viewed` review is not a grade — it is recorded when a card is skipped —
 * so it counts toward neither tally.
 */
export function countSrsTallies(
  reviewed: readonly { difficulty: SrsDifficulty }[],
): SrsTallies {
  return reviewed.reduce<SrsTallies>(
    (tallies, { difficulty }) => {
      if (difficulty === 'easy') {
        return { ...tallies, easy: tallies.easy + 1 };
      }
      if (difficulty === 'hard') {
        return { ...tallies, hard: tallies.hard + 1 };
      }
      return tallies;
    },
    { hard: 0, easy: 0 },
  );
}
