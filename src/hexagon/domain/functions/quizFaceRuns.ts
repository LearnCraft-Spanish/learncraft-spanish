import { splitSpanishTextRuns } from '@domain/functions/splitSpanishTextRuns';

export interface QuizFaceRun {
  text: string;
  bold: boolean;
}

/** Markdown-style `**target**` marker, stripped without special-casing. */
const MARKDOWN_BOLD = /\*\*([^*]+)\*\*/g;

/**
 * Runs for a quiz card face. Spanish always renders bold (+ italic, via the
 * `.bold` CSS class) — plain Spanish, the Spanish stretch of a Spanglish
 * sentence (`*english*`), and text that was previously wrapped in a
 * markdown `**target**` marker all read identically now. Embedded English
 * inside a Spanglish sentence is the only thing that stays regular.
 *
 * `**…**` markers are stripped up front so they never render literally, but
 * no longer mark a distinct run — the sentence is bold either way.
 */
export function quizFaceRuns(spanish: string): QuizFaceRun[] {
  if (spanish.length === 0) {
    return [];
  }

  const withoutMarkdownMarkers = spanish.replace(MARKDOWN_BOLD, '$1');

  return splitSpanishTextRuns(withoutMarkdownMarkers).map((run) => ({
    text: run.text,
    bold: !run.english,
  }));
}
