import type { FlashcardForDisplay } from 'src/hexagon/domain/quizzing';

export interface FlashcardDisplayProps {
  quizExample: FlashcardForDisplay;
  answerShowing: boolean;
  addFlashcard: () => void;
  removeFlashcard: () => void;
  toggleAnswer: () => void;
  togglePlaying: () => void;
  playing: boolean;
}
