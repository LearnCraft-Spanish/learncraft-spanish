import type { AddPendingRemoveProps } from '@application/units/useTextQuiz/useTextQuiz';
import type { FlashcardForDisplay } from '@domain/quizzing';
import type { AudioControlHandle } from '@interface/components/general/AudioControl/AudioControl';
import type React from 'react';

export interface FlashcardDisplayProps {
  quizExample: FlashcardForDisplay | null;
  answerShowing: boolean;
  addPendingRemoveProps: AddPendingRemoveProps | undefined;
  toggleAnswer: () => void;
  getHelpIsOpen: boolean;
  setGetHelpIsOpen: (getHelpIsOpen: boolean) => void;
  audioControlRef?: React.RefObject<AudioControlHandle | null>;
}
