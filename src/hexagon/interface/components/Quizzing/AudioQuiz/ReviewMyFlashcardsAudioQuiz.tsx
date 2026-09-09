import type { AudioQuizProps } from '@application/units/AudioQuiz/useAudioQuiz';
import type { JSX } from 'react';
import { useReviewMyFlashcardsAudioQuiz } from '@application/units/AudioQuiz/useReviewMyFlashcardsAudioQuiz';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import { AudioQuizV2Screen } from '@interface/components/Quizzing/AudioQuiz/AudioQuizV2Screen';

interface ReviewMyFlashcardsAudioQuizProps {
  audioQuizProps: AudioQuizProps;
}

/**
 * Gating the redesign here matches `RegularAudioQuiz` and `RegularTextQuiz`.
 * Only `useStudentUiVersion` lives here — each version branch owns its own
 * `useReviewMyFlashcardsAudioQuiz` call.
 */
export function ReviewMyFlashcardsAudioQuiz({
  audioQuizProps,
}: ReviewMyFlashcardsAudioQuizProps): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.audioquiz.v2');

  return version === 'v2' ? (
    <ReviewMyFlashcardsAudioQuizV2 audioQuizProps={audioQuizProps} />
  ) : (
    <ReviewMyFlashcardsAudioQuizV1 audioQuizProps={audioQuizProps} />
  );
}

function ReviewMyFlashcardsAudioQuizV1({
  audioQuizProps,
}: ReviewMyFlashcardsAudioQuizProps): JSX.Element {
  const audioQuizReturn = useReviewMyFlashcardsAudioQuiz({ audioQuizProps });
  return <AudioQuiz audioQuizReturn={audioQuizReturn} />;
}

function ReviewMyFlashcardsAudioQuizV2({
  audioQuizProps,
}: ReviewMyFlashcardsAudioQuizProps): JSX.Element {
  const audioQuizReturn = useReviewMyFlashcardsAudioQuiz({ audioQuizProps });
  return <AudioQuizV2Screen audioQuizReturn={audioQuizReturn} />;
}
