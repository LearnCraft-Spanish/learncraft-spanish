/**
 * Derived copy for the custom quiz setup screen. The count line and the CTA
 * deliberately disagree: the count is everything that matches the filters,
 * the CTA is what the quiz will actually draw. A tag with 7 cards under a
 * length of 20 reads "7 flashcards found" beside "Quiz 7 flashcards", which
 * is the whole point of showing both.
 */

/** Courses whose short code is not the initials of their name. */
const SHORT_CODE_OVERRIDES: Record<string, string> = {
  'LearnCraft Spanish': 'lcsp',
  'Spanish in One Month': 'si1m',
};

export type CustomQuizNoun = 'flashcards' | 'audio examples';

export function quizNoun(audioQuiz: boolean): CustomQuizNoun {
  return audioQuiz ? 'audio examples' : 'flashcards';
}

export function courseShortCode(courseName: string | null): string {
  if (courseName === null) {
    return '';
  }

  const override = SHORT_CODE_OVERRIDES[courseName];
  if (override !== undefined) {
    return override;
  }

  return courseName
    .split(/[\s-]+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .join('')
    .toLowerCase();
}

export function fromLessonText(
  courseName: string | null,
  fromLessonNumber: number | null,
): string {
  if (courseName === null || fromLessonNumber === null) {
    return '';
  }

  const code = courseShortCode(courseName);
  return code.length > 0
    ? `From lesson ${code} ${fromLessonNumber}`
    : `From lesson ${fromLessonNumber}`;
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
