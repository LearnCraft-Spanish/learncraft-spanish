/**
 * Domain logic for Spaced Repetition System (SRS) interval calculations
 */

export type SrsDifficulty = 'easy' | 'hard';

/**
 * Calculates the new interval for a flashcard based on the current interval and difficulty
 * @param currentInterval - The current review interval of the flashcard
 * @param difficulty - Whether the user found the flashcard easy or hard
 * @returns The new interval (minimum 0)
 */
export function calculateNewSrsInterval(
  currentInterval: number,
  difficulty: SrsDifficulty,
): number {
  if (difficulty === 'easy') {
    return currentInterval + 1;
  } else {
    return Math.max(0, currentInterval - 1);
  }
}

/**
 * Gets the current interval from a flashcard, defaulting to 0 if not set
 * @param flashcard - The flashcard to get the interval from
 * @param flashcard.interval - The interval property of the flashcard
 * @returns The current interval (defaults to 0 if null or undefined)
 */
export function getCurrentInterval(flashcard: {
  interval?: number | null;
}): number {
  return flashcard.interval ?? 0;
}
