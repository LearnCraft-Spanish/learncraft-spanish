import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import type { JSX } from 'react';
import { useReviewMyFlashcardsTextQuiz } from '@application/useCases/TextQuiz/useReviewMyFlashcardsTextQuiz';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { TextQuizV2Screen } from '@interface/components/Quizzing/TextQuiz/TextQuizV2Screen';

interface ReviewMyFlashcardsTextQuizProps {
  quizTitle?: string;
  textQuizProps: UseTextQuizProps;
}

/**
 * Only `useStudentUiVersion` lives here — each version branch owns
 * `useReviewMyFlashcardsTextQuiz`, matching Home / CustomQuiz / FlashcardFinder.
 */
export function ReviewMyFlashcardsTextQuiz({
  quizTitle,
  textQuizProps,
}: ReviewMyFlashcardsTextQuizProps): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.textquiz.v2');

  return version === 'v2' ? (
    <ReviewMyFlashcardsTextQuizV2
      quizTitle={quizTitle}
      textQuizProps={textQuizProps}
    />
  ) : (
    <ReviewMyFlashcardsTextQuizV1
      quizTitle={quizTitle}
      textQuizProps={textQuizProps}
    />
  );
}

function ReviewMyFlashcardsTextQuizV1({
  quizTitle,
  textQuizProps,
}: ReviewMyFlashcardsTextQuizProps): JSX.Element {
  const useReviewMyFlashcardsTextQuizReturn =
    useReviewMyFlashcardsTextQuiz(textQuizProps);
  return (
    <TextQuiz
      useTextQuizReturn={useReviewMyFlashcardsTextQuizReturn}
      quizTitle={quizTitle}
    />
  );
}

function ReviewMyFlashcardsTextQuizV2({
  quizTitle,
  textQuizProps,
}: ReviewMyFlashcardsTextQuizProps): JSX.Element {
  const useReviewMyFlashcardsTextQuizReturn =
    useReviewMyFlashcardsTextQuiz(textQuizProps);
  return (
    <TextQuizV2Screen
      useTextQuizReturn={useReviewMyFlashcardsTextQuizReturn}
      quizTitle={quizTitle}
    />
  );
}
