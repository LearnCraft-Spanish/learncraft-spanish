import type { TextQuizProps } from './TextQuiz';
import { useSrsFunctionality } from '@application/units/useTextQuiz';
import { TextQuiz } from './TextQuiz';

export function SrsQuiz(textQuizProps: TextQuizProps) {
  const {
    examplesReviewedResults,
    handleReviewExample,
    hasExampleBeenReviewed,
  } = useSrsFunctionality();

  return (
    <TextQuiz
      {...textQuizProps}
      srsQuizProps={{
        examplesReviewedResults,
        handleReviewExample,
        hasExampleBeenReviewed,
      }}
    />
  );
}
