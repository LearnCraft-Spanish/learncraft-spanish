import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import { useReviewMyFlashcardsTextQuiz } from '@application/useCases/TextQuiz/useReviewMyFlashcardsTextQuiz';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
export function ReviewMyFlashcardsTextQuiz({
  quizTitle,
  textQuizProps,
}: {
  quizTitle?: string;
  textQuizProps: UseTextQuizProps;
}) {
  const useReviewMyFlashcardsTextQuizReturn =
    useReviewMyFlashcardsTextQuiz(textQuizProps);
  return (
    <TextQuiz
      useTextQuizReturn={useReviewMyFlashcardsTextQuizReturn}
      quizTitle={quizTitle}
    />
  );
}
