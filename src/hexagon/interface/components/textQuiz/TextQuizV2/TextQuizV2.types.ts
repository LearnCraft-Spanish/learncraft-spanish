import type { AddPendingRemoveProps } from '@application/units/useTextQuiz';
import type { VocabInfo } from '@application/units/useVocabInfo';
import type { SrsTallies } from '@domain/functions/srsTallies';
import type { FlashcardForDisplay } from '@domain/quizzing';
import type { SrsDifficulty } from '@domain/srs';
import type { Vocabulary } from '@learncraft-spanish/shared';

/**
 * The v2 text quiz screen. One card serves both variants; `srs` is the only
 * switch, and it controls exactly three things — the answer-side dock, the
 * tallies, and swipe-to-grade.
 */
export interface TextQuizV2Props {
  /** `true` renders the grading dock, the tallies, and swipe. */
  srs: boolean;
  /** Rendered as the desktop context line beside the position readout. */
  quizTitle?: string;
  /** 1-based position in the deck. */
  exampleNumber: number;
  quizLength: number;
  quizExample: FlashcardForDisplay | null;
  /** `false` shows the prompt side, `true` the answer side. */
  answerShowing: boolean;
  toggleAnswer: () => void;
  getHelpIsOpen: boolean;
  setGetHelpIsOpen: (getHelpIsOpen: boolean) => void;
  /** Supplies the word panel's gloss, part of speech, and lessons. */
  vocabInfoHook: (vocab: Vocabulary) => VocabInfo;
  /** Absent for non-students, who cannot favourite a card. */
  addPendingRemoveProps: AddPendingRemoveProps | undefined;
  onPrevious: () => void;
  onNext: () => void;
  /** SRS only. Grades the current card and advances. */
  onGrade?: (difficulty: SrsDifficulty) => void;
  /** SRS only. Running counts of what has been graded this quiz. */
  tallies?: SrsTallies;
  /** Exits the quiz back to quiz setup. */
  onExit: () => void;
}
