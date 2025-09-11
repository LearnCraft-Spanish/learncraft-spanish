import type { AddPendingRemoveProps } from 'src/hexagon/application/units/useTextQuiz/useTextQuiz';
import type { FlashcardForDisplay } from 'src/hexagon/domain/quizzing';
export interface FlashcardDisplayProps {
  quizExample: FlashcardForDisplay | null;
  answerShowing: boolean;
  addPendingRemoveProps: AddPendingRemoveProps | undefined;
  toggleAnswer: () => void;
  allowGetHelp: boolean;
  getHelpIsOpen: boolean;
  setGetHelpIsOpen: (getHelpIsOpen: boolean) => void;
}
