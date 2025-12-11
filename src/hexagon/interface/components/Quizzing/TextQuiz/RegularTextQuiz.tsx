import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import { useTextQuiz } from '@application/units/useTextQuiz';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
export function RegularTextQuiz({
  quizTitle,
  textQuizProps,
}: {
  quizTitle?: string;
  textQuizProps: UseTextQuizProps;
}) {
  const useTextQuizReturn = useTextQuiz(textQuizProps);
  return (
    <TextQuiz useTextQuizReturn={useTextQuizReturn} quizTitle={quizTitle} />
  );
}
