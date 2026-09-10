import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import type { JSX } from 'react';
import { useReviewMyFlashcardsTextQuiz } from '@application/useCases/TextQuiz/useReviewMyFlashcardsTextQuiz';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { textQuizTitle } from '@domain/functions/quizTitle';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { TextQuizV2Screen } from '@interface/components/Quizzing/TextQuiz/TextQuizV2Screen';

interface ReviewMyFlashcardsTextQuizProps {
  textQuizProps: UseTextQuizProps;
}

/**
 * Always the My Flashcards (non-SRS) text quiz — its title is fixed rather
 * than threaded through as a prop, same rationale as `SrsTextQuiz`.
 *
 * Only `useStudentUiVersion` lives here — each version branch owns
 * `useReviewMyFlashcardsTextQuiz`, matching Home / CustomQuiz / FlashcardFinder.
 */
export function ReviewMyFlashcardsTextQuiz({
  textQuizProps,
}: ReviewMyFlashcardsTextQuizProps): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.textquiz.v2');

  return version === 'v2' ? (
    <ReviewMyFlashcardsTextQuizV2 textQuizProps={textQuizProps} />
  ) : (
    <ReviewMyFlashcardsTextQuizV1 textQuizProps={textQuizProps} />
  );
}

function ReviewMyFlashcardsTextQuizV1({
  textQuizProps,
}: ReviewMyFlashcardsTextQuizProps): JSX.Element {
  const useReviewMyFlashcardsTextQuizReturn =
    useReviewMyFlashcardsTextQuiz(textQuizProps);
  const title = textQuizTitle('myFlashcards', false);
  return (
    <TextQuiz
      useTextQuizReturn={useReviewMyFlashcardsTextQuizReturn}
      quizTitle={title.subtitle}
    />
  );
}

function ReviewMyFlashcardsTextQuizV2({
  textQuizProps,
}: ReviewMyFlashcardsTextQuizProps): JSX.Element {
  const useReviewMyFlashcardsTextQuizReturn =
    useReviewMyFlashcardsTextQuiz(textQuizProps);
  const title = textQuizTitle('myFlashcards', false);
  return (
    <TextQuizV2Screen
      useTextQuizReturn={useReviewMyFlashcardsTextQuizReturn}
      eyebrow={title.eyebrow}
      subtitle={title.subtitle}
    />
  );
}
