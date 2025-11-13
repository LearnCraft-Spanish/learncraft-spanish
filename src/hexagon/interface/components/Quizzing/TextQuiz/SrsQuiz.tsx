import type { TextQuizComponentProps } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { useSrsFunctionality } from '@application/units/useTextQuiz';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';

export function SrsQuiz(textQuizProps: TextQuizComponentProps) {
  const {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
    isExampleReviewPending,
  } = useSrsFunctionality();

  return (
    <TextQuiz
      {...textQuizProps}
      srsQuizProps={{
        examplesReviewedResults,
        handleReviewExample,
        hasExampleBeenReviewed,
        isExampleReviewPending,
      }}
    />
  );
}
