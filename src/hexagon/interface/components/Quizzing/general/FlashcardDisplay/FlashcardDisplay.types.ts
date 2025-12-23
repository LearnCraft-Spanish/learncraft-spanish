import type { AddPendingRemoveProps } from '@application/units/useTextQuiz/useTextQuiz';
import type { FlashcardForDisplay } from '@domain/quizzing';
export interface FlashcardDisplayProps {
  quizExample: FlashcardForDisplay | null;
  answerShowing: boolean;
  addPendingRemoveProps: AddPendingRemoveProps | undefined;
  toggleAnswer: () => void;
  getHelpIsOpen: boolean;
  setGetHelpIsOpen: (getHelpIsOpen: boolean) => void;
}
