import type { AddPendingRemoveProps } from '@application/units/useTextQuiz';
import type { VocabInfo } from '@application/units/useVocabInfo';
import type { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import type { Vocabulary } from '@learncraft-spanish/shared';

/**
 * The v2 audio quiz screen — one card serves both speaking and listening;
 * `audioQuizType` only changes copy (`audioQuizCopy`), never layout.
 * Mirrors `useAudioQuiz`'s `AudioQuizReturn` closely enough that the bridge
 * (`AudioQuizV2Screen`) is a thin prop pass-through.
 */
export interface AudioQuizV2Props {
  audioQuizType: AudioQuizType;
  autoplay: boolean;
  /** 1-based position in the deck. */
  exampleNumber: number;
  quizLength: number;
  currentStep: AudioQuizStep;
  /** May contain a `**target**` markdown marker for bold emphasis. */
  displayText: string;
  /** `currentStepValue.spanish` — which language the current step is in. */
  isSpanishText: boolean;
  /** 0–100. Autoplay's left-to-right card fill; ignored when `!autoplay`. */
  progressStatus: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  /** Advances the quiz — `nextStep` from `useAudioQuiz`. */
  onPrimary: () => void;
  /** Restarts the current step's audio — `restartCurrentStep`. */
  onReplay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onExit: () => void;
  getHelpIsOpen: boolean;
  setGetHelpIsOpen: (getHelpIsOpen: boolean) => void;
  vocabulary: Vocabulary[];
  vocabComplete: boolean;
  vocabInfoHook: (vocab: Vocabulary) => VocabInfo;
  /** Undefined for non-students, who cannot favourite a card. */
  addPendingRemoveProps: AddPendingRemoveProps | undefined;
}
