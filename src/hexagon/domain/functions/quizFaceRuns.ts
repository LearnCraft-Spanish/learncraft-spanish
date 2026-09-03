import { splitSpanishTextRuns } from '@domain/functions/splitSpanishTextRuns';

export interface QuizFaceRun {
  text: string;
  bold: boolean;
}

/** Markdown-style `**target**` on an otherwise plain Spanish sentence. */
const MARKDOWN_BOLD = /\*\*([^*]+)\*\*/g;

/**
 * Runs for a quiz card face.
 *
 * - Plain Spanish: regular weight (nothing to emphasize).
 * - Spanglish (`*english*`): Spanish stretches bold, embedded English regular.
 * - Pure Spanish with a markdown target (`**sabré**`): only the marked target
 *   is bold. Spanglish single-asterisk markup still wins when there is no
 *   `**…**` pair, so `Son de *wood.*` is unchanged.
 */
export function quizFaceRuns(spanish: string): QuizFaceRun[] {
  if (spanish.length === 0) {
    return [];
  }

  if (hasMarkdownBoldTarget(spanish)) {
    return markdownBoldRuns(spanish);
  }

  const runs = splitSpanishTextRuns(spanish);
  const isSpanglish = runs.some((run) => run.english);

  return runs.map((run) => ({
    text: run.text,
    bold: isSpanglish && !run.english,
  }));
}

function hasMarkdownBoldTarget(spanish: string): boolean {
  return /\*\*[^*]+\*\*/.test(spanish);
}

function markdownBoldRuns(spanish: string): QuizFaceRun[] {
  const runs: QuizFaceRun[] = [];
  let lastIndex = 0;

  for (const match of spanish.matchAll(MARKDOWN_BOLD)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      runs.push({ text: spanish.slice(lastIndex, index), bold: false });
    }
    runs.push({ text: match[1], bold: true });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < spanish.length) {
    runs.push({ text: spanish.slice(lastIndex), bold: false });
  }

  return runs;
}
