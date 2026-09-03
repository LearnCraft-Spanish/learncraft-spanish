import type { UseTextQuizProps } from '@application/units/useTextQuiz';
import type { JSX } from 'react';
import { useTextQuiz } from '@application/units/useTextQuiz';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import { TextQuiz } from '@interface/components/Quizzing/TextQuiz/TextQuiz';
import { TextQuizV2Screen } from '@interface/components/Quizzing/TextQuiz/TextQuizV2Screen';

interface RegularTextQuizProps {
  quizTitle?: string;
  textQuizProps: UseTextQuizProps;
}

/**
 * Used by Official Quizzes and both Custom Quiz implementations. Gating the
 * redesign here, rather than in each page, covers all three at once.
 *
 * Only `useStudentUiVersion` lives here — each version branch owns
 * `useTextQuiz`, matching Home / CustomQuiz / FlashcardFinder.
 */
export function RegularTextQuiz({
  quizTitle,
  textQuizProps,
}: RegularTextQuizProps): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.textquiz.v2');

  return version === 'v2' ? (
    <RegularTextQuizV2 quizTitle={quizTitle} textQuizProps={textQuizProps} />
  ) : (
    <RegularTextQuizV1 quizTitle={quizTitle} textQuizProps={textQuizProps} />
  );
}

function RegularTextQuizV1({
  quizTitle,
  textQuizProps,
}: RegularTextQuizProps): JSX.Element {
  const useTextQuizReturn = useTextQuiz(textQuizProps);
  return <TextQuiz useTextQuizReturn={useTextQuizReturn} quizTitle={quizTitle} />;
}

function RegularTextQuizV2({
  quizTitle,
  textQuizProps,
}: RegularTextQuizProps): JSX.Element {
  const useTextQuizReturn = useTextQuiz(textQuizProps);
  return (
    <TextQuizV2Screen
      useTextQuizReturn={useTextQuizReturn}
      quizTitle={quizTitle}
    />
  );
}
