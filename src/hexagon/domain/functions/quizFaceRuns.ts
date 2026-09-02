import { splitSpanishTextRuns } from '@domain/functions/splitSpanishTextRuns';

export interface QuizFaceRun {
  text: string;
  bold: boolean;
}

/**
 * Runs for a quiz card face.
 *
 * A plain Spanish sentence reads at regular weight, like the English side. Only
 * a Spanglish sentence — one carrying English wrapped in asterisks — bolds its
 * Spanish, which is what tells the two languages apart on the card. Bolding a
 * sentence that is entirely Spanish would emphasize nothing.
 */
export function quizFaceRuns(spanish: string): QuizFaceRun[] {
  const runs = splitSpanishTextRuns(spanish);
  const isSpanglish = runs.some((run) => run.english);

  return runs.map((run) => ({
    text: run.text,
    bold: isSpanglish && !run.english,
  }));
}
