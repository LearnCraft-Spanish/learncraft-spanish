/**
 * Domain logic for Spaced Repetition System (SRS) interval calculations
 */

export type SrsDifficulty = 'easy' | 'hard' | 'viewed';
/**
 * Calculates the new interval for a flashcard based on the current interval and difficulty
 * @param currentInterval - The current review interval of the flashcard
 * @param difficulty - Whether the user found the flashcard easy, hard, or just viewed it
 * @returns The new interval (minimum 0)
 */
export function calculateNewSrsInterval(
  currentInterval: number,
  difficulty: SrsDifficulty,
): number {
  if (difficulty === 'easy') {
    return currentInterval + 1;
  } else if (difficulty === 'hard') {
    return Math.max(0, currentInterval - 1);
  } else {
    // 'viewed' - keep the same interval, just update lastReviewedDate
    return currentInterval;
  }
}
