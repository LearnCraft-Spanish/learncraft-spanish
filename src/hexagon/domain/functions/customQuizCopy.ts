/**
 * Derived copy for the custom quiz setup screen. The count line and the CTA
 * deliberately disagree: the count is everything that matches the filters,
 * the CTA is what the quiz will actually draw. A tag with 7 cards under a
 * length of 20 reads "7 flashcards found" beside "Quiz 7 flashcards", which
 * is the whole point of showing both.
 */

export type CustomQuizNoun = 'flashcards' | 'audio examples';

export function quizNoun(audioQuiz: boolean): CustomQuizNoun {
  return audioQuiz ? 'audio examples' : 'flashcards';
}

export function countLabel(count: number, audioQuiz: boolean): string {
  return `${count.toLocaleString('en-US')} ${quizNoun(audioQuiz)} found`;
}

/**
 * What the quiz will actually draw. `null` length means "All".
 */
export function effectiveQuizCount(
  count: number,
  quizLength: number | null,
): number {
  if (quizLength === null) {
    return count;
  }
  return Math.min(count, Math.max(0, quizLength));
}

export function ctaLabel(
  count: number,
  quizLength: number | null,
  audioQuiz: boolean,
): string {
  const effective = effectiveQuizCount(count, quizLength);
  return `Quiz ${effective.toLocaleString('en-US')} ${quizNoun(audioQuiz)}`;
}
