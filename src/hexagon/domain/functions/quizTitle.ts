/**
 * Two-tier active-quiz title copy: an eyebrow naming the quiz category
 * (Custom Quiz / My Flashcards Quiz / Official Quizzes) and a subtitle
 * naming the specific form being taken (Text Quiz / SRS Quiz / Listening
 * Quiz / Speaking Quiz), or — for Official Quizzes only — the course and
 * quiz number pulled from the API, since an official quiz has no "form"
 * choice the way custom/my-flashcards quizzes do.
 *
 * Used by `QuizProgressHeader` (text/SRS) and `AudioQuizProgressHeader`
 * (listening/speaking) via their screen bridges (`RegularTextQuiz`,
 * `SrsTextQuiz`, `ReviewMyFlashcardsTextQuiz`, `RegularAudioQuiz`,
 * `ReviewMyFlashcardsAudioQuiz`, `OfficialQuiz`) — each bridge already
 * knows which category and form it renders, so this stays a pure lookup.
 */

/** Official quizzes build their title with `officialQuizTitle` instead —
 * they have no category union member here because nothing else about
 * them (form, category eyebrow) varies the way custom/my-flashcards do. */
export type QuizCategory = 'custom' | 'myFlashcards';

export interface QuizTitleCopy {
  eyebrow: string;
  subtitle: string;
}

const CATEGORY_EYEBROW: Record<QuizCategory, string> = {
  custom: 'Custom Quiz',
  myFlashcards: 'My Flashcards Quiz',
};

export const OFFICIAL_QUIZ_EYEBROW = 'Official Quizzes';

/** `srs` picks "SRS Quiz" vs "Text Quiz" — Official quizzes never reach
 * here; they have no SRS mode and use `officialQuizTitle` instead. */
export function textQuizTitle(
  category: QuizCategory,
  srs: boolean,
): QuizTitleCopy {
  return {
    eyebrow: CATEGORY_EYEBROW[category],
    subtitle: srs ? 'SRS Quiz' : 'Text Quiz',
  };
}

/** `speaking` picks "Speaking Quiz" vs "Listening Quiz". */
export function audioQuizTitle(
  category: QuizCategory,
  speaking: boolean,
): QuizTitleCopy {
  return {
    eyebrow: CATEGORY_EYEBROW[category],
    subtitle: speaking ? 'Speaking Quiz' : 'Listening Quiz',
  };
}

/**
 * `courseAndQuizNumber` is the API's combined title string (e.g.
 * `"LCSP - Lesson 5"`) — it is the subtitle as-is, never reformatted here.
 */
export function officialQuizTitle(courseAndQuizNumber: string): QuizTitleCopy {
  return {
    eyebrow: OFFICIAL_QUIZ_EYEBROW,
    subtitle: courseAndQuizNumber,
  };
}
