import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import { useReviewMyFlashcardsTextQuiz } from '@application/useCases/TextQuiz/useReviewMyFlashcardsTextQuiz';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { TextQuizV2Screen } from '@interface/components/Quizzing/TextQuiz/TextQuizV2Screen';

export function ReviewMyFlashcardsTextQuiz({
  quizTitle,
  textQuizProps,
}: {
  quizTitle?: string;
  textQuizProps: UseTextQuizProps;
}) {
  const useReviewMyFlashcardsTextQuizReturn =
    useReviewMyFlashcardsTextQuiz(textQuizProps);
  const { version } = useStudentUiVersion('ui.student.textquiz.v2');

  return version === 'v2' ? (
    <TextQuizV2Screen
      useTextQuizReturn={useReviewMyFlashcardsTextQuizReturn}
      quizTitle={quizTitle}
    />
  ) : (
    <TextQuiz
      useTextQuizReturn={useReviewMyFlashcardsTextQuizReturn}
      quizTitle={quizTitle}
    />
  );
}
