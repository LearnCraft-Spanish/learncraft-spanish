import type { TextQuizComponentProps } from './TextQuiz';
import { useSrsFunctionality } from '@application/units/useTextQuiz';
import { TextQuiz } from './TextQuiz';

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
