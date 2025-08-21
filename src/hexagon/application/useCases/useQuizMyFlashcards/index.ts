import type { TextQuizReturn } from '@application/units/useTextQuiz';
import type {
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { useTextQuiz } from '@application/units/useTextQuiz';
import { useCallback, useMemo, useState } from 'react';

export interface QuizSetupOptions {
  availableFlashcards: Flashcard[];
  srsQuiz: boolean;
  setSrsQuiz: (srsQuiz: boolean) => void;
  customOnly: boolean;
  setCustomOnly: (customOnly: boolean) => void;
  startWithSpanish: boolean;
  setStartWithSpanish: (startWithSpanish: boolean) => void;
  quizLength: number;
  setQuizLength: (quizLength: number) => void;
  startQuiz: () => void;
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
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizLength, setQuizLength] = useState(10);
  const [customOnly, setCustomOnly] = useState(false);
  const [startWithSpanish, setStartWithSpanish] = useState<boolean>(false);
  const [srsQuiz, setSrsQuiz] = useState<boolean>(true);

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
    isLoading,
    error,
    getRandomFlashcards,
    getRandomCustomFlashcards,
    getRandomFlashcardsDueForReview,
    getRandomCustomFlashcardsDueForReview,
  } = useStudentFlashcards();

  const setupQuiz = useCallback(() => {
    if (!flashcards?.length || !flashcardsDueForReview?.length) {
      return;
    }
    if (srsQuiz) {
      if (customOnly) {
        const flashcards = getRandomCustomFlashcardsDueForReview(quizLength);
        setSelectedFlashcards(flashcards);
      } else {
        const flashcards = getRandomFlashcardsDueForReview(quizLength);
        setSelectedFlashcards(flashcards);
      }
    } else if (customOnly) {
      const flashcards = getRandomCustomFlashcards(quizLength);
      setSelectedFlashcards(flashcards);
    } else {
      const flashcards = getRandomFlashcards(quizLength);
      setSelectedFlashcards(flashcards);
    }
  }, [
    quizLength,
    getRandomFlashcards,
    getRandomCustomFlashcards,
    getRandomFlashcardsDueForReview,
    getRandomCustomFlashcardsDueForReview,
    srsQuiz,
    flashcards,
    flashcardsDueForReview,
    customOnly,
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
  ]);

  const quizSetupOptions = {
    availableFlashcards: filteredFlashcards,
    srsQuiz,
    setSrsQuiz,
    customOnly,
    setCustomOnly,
    startWithSpanish,
    setStartWithSpanish,
    quizLength,
    setQuizLength,
    startQuiz: setupQuiz,
  };

  const reviewFlashcards = useMemo(() => {
    // NOTE: Running the isFlashcardCollected here will not work.
    // The selectedFlashcards here are a duplicate of the flashcards in the state.
    // So we need to check the flashcards in the state.
    return selectedFlashcards.filter((flashcard) =>
      flashcards?.some((f) => f.id === flashcard.id),
    );
  }, [selectedFlashcards, flashcards]);

  const reviewExamples: ExampleWithVocabulary[] = useMemo(() => {
    return reviewFlashcards.map((flashcard) => flashcard.example);
  }, [reviewFlashcards]);

  const reviewQuiz = useTextQuiz({
    examples: reviewExamples,
    canCollectFlashcards: true,
    startWithSpanish,
  });

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
    textQuiz: reviewQuiz,
    setupQuiz,
    isLoading,
    error,
  };
};
