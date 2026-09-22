export interface SpanishTextRun {
  text: string;
  /** True when this run was wrapped in asterisks (embedded English). */
  english: boolean;
}

/**
 * Splits a Spanish flashcard sentence on asterisks. Odd segments are
 * embedded English and should render at regular weight; even segments are
 * Spanish and should render bold. Asterisks themselves are not kept.
 */
export function splitSpanishTextRuns(spanish: string): SpanishTextRun[] {
  return spanish.split('*').flatMap((text, index) => {
    if (text.length === 0) {
      return [];
    }
    return [{ text, english: index % 2 === 1 }];
  });
}
