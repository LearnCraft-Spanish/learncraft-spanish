import type { TextQuizReturn } from '@application/units/useTextQuiz';
import type { Flashcard } from '@learncraft-spanish/shared';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
// import { useTextQuiz } from '@application/units/useTextQuiz';
import { useCallback, useMemo, useState } from 'react';

export interface QuizSetupOptions {
  availableFlashcards: Flashcard[];
  quizType: 'text' | 'audio';
  setQuizType: (quizType: 'text' | 'audio') => void;
  audioQuizVariant: 'speaking' | 'listening';
  setAudioQuizVariant: (audioQuizVariant: 'speaking' | 'listening') => void;
  srsQuiz: boolean;
  setSrsQuiz: (srsQuiz: boolean) => void;
  hasCustomFlashcards: boolean;
  customOnly: boolean;
  setCustomOnly: (customOnly: boolean) => void;
  startWithSpanish: boolean;
  setStartWithSpanish: (startWithSpanish: boolean) => void;
  quizLength: number;
  setQuizLength: (quizLength: number) => void;
  startQuiz: () => void;
  autoplay: boolean;
  setAutoplay: (autoplay: boolean) => void;
}

interface UseQuizMyFlashcardsReturn {
  quizLength: number;
  filteredFlashcards: Flashcard[];
  updateQuizLength: (newQuizLength: number) => void;
  quizSetupOptions: QuizSetupOptions;
  showQuiz: boolean;
  hideQuiz: () => void;
  textQuiz: TextQuizReturn;
  setupQuiz: () => void;
  isLoading: boolean;
  error: Error | null;
}

export const useQuizMyFlashcards = (): UseQuizMyFlashcardsReturn => {
  // Quiz Type Setting
  const [quizType, setQuizType] = useState<'text' | 'audio'>('text');
  // Text Quiz Settings
  const [startWithSpanish, setStartWithSpanish] = useState<boolean>(false);
  const [srsQuiz, setSrsQuiz] = useState<boolean>(true);
  const [customOnly, setCustomOnly] = useState(false);
  // Audio Quiz Settings
  const [audioQuizVariant, setAudioQuizVariant] = useState<
    'speaking' | 'listening'
  >('speaking');
  const [autoplay, setAutoplay] = useState<boolean>(true);
  // General Quiz Settings
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizLength, setQuizLength] = useState(10);

  // NOTE: This is a COPY of the flashcards in the state.
  // We need to keep this in sync with the flashcards in the state.
  // It is used for a one-time randomization of the quiz, and so that
  // new examples are not added when some are removed.
  const [selectedFlashcards, setSelectedFlashcards] = useState<Flashcard[]>([]);

  const {
    flashcards,
    flashcardsDueForReview,
    customFlashcards,
    customFlashcardsDueForReview,
    audioFlashcards,
    isLoading,
    error,
    getRandomFlashcards,
  } = useStudentFlashcards();

  const setupQuiz = useCallback(() => {
    if (!flashcards?.length) {
      return;
    }
    let randomizedFlashcards = [];

    if (quizType === 'text') {
      randomizedFlashcards = getRandomFlashcards({
        count: quizLength,
        customOnly,
        dueForReviewOnly: srsQuiz,
      });
      // } else if (quizType === 'audio') {
    } else {
      randomizedFlashcards = getRandomFlashcards({
        count: quizLength,
        audioOnly: true,
      });
    }
    setSelectedFlashcards(randomizedFlashcards);
  }, [
    quizLength,
    quizType,
    getRandomFlashcards,
    srsQuiz,
    customOnly,
    flashcards,
  ]);

  const filteredFlashcards: Flashcard[] = useMemo(() => {
    if (srsQuiz) {
      if (customOnly) {
        return customFlashcardsDueForReview ?? [];
      } else {
        return flashcardsDueForReview ?? [];
      }
    } else if (customOnly) {
      return customFlashcards ?? [];
    } else if (quizType === 'audio') {
      return audioFlashcards ?? [];
    } else {
      return flashcards ?? [];
    }
  }, [
    srsQuiz,
    customOnly,
    flashcards,
    flashcardsDueForReview,
    customFlashcards,
    customFlashcardsDueForReview,
    audioFlashcards,
    quizType,
  ]);

  const quizSetupOptions = {
    availableFlashcards: filteredFlashcards,

    quizType,
    setQuizType,

    audioQuizVariant,
    setAudioQuizVariant,
    autoplay,
    setAutoplay,
    srsQuiz,
    setSrsQuiz,
    hasCustomFlashcards: !!(customFlashcards && customFlashcards.length > 0),
    customOnly,
    setCustomOnly,
    startWithSpanish,
    setStartWithSpanish,
    quizLength,
    setQuizLength,
    startQuiz: setupQuiz,
  };

  // const reviewFlashcards = useMemo(() => {
  //   // NOTE: Running the isFlashcardCollected here will not work.
  //   // The selectedFlashcards here are a duplicate of the flashcards in the state.
  //   // So we need to check the flashcards in the state.
  //   return selectedFlashcards.filter((flashcard) =>
  //     flashcards?.some((f) => f.id === flashcard.id),
  //   );
  // }, [selectedFlashcards, flashcards]);

  // const reviewExamples: ExampleWithVocabulary[] = useMemo(() => {
  //   return reviewFlashcards.map((flashcard) => flashcard.example);
  // }, [reviewFlashcards]);

  // const reviewQuiz = useTextQuiz({
  //   examples: reviewExamples,
  //   canCollectFlashcards: true,
  //   startWithSpanish,
  // });

  const updateQuizLength = useCallback(
    (newQuizLength: number) => {
      if (!flashcards?.length || !flashcardsDueForReview?.length) {
        return;
      }
      if (srsQuiz) {
        if (newQuizLength > flashcardsDueForReview.length) {
          setQuizLength(flashcardsDueForReview.length);
        }
        setQuizLength(newQuizLength);
      } else {
        if (newQuizLength > flashcards.length) {
          setQuizLength(flashcards.length);
        }
        setQuizLength(newQuizLength);
      }
    },
    [srsQuiz, flashcards, flashcardsDueForReview],
  );

  const hideQuiz = useCallback(() => {
    setShowQuiz(false);
  }, []);

  return {
    quizLength,
    filteredFlashcards,
    updateQuizLength,
    quizSetupOptions,
    showQuiz,
    hideQuiz,
    // textQuiz: reviewQuiz,
    setupQuiz,
    isLoading,
    error,
  };
};
