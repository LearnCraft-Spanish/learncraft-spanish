import type { AudioQuizProps } from '@application/units/AudioQuiz/useAudioQuiz';
import type { JSX } from 'react';
import { useAudioQuiz } from '@application/units/AudioQuiz/useAudioQuiz';
import { useStudentUiVersion } from '@application/useCases/useStudentUiVersion';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';
import { AudioQuizV2Screen } from '@interface/components/Quizzing/AudioQuiz/AudioQuizV2Screen';

interface RegularAudioQuizProps {
  audioQuizProps: AudioQuizProps;
}

/**
 * Gating the redesign here, rather than in each page, matches
 * `RegularTextQuiz`. Only `useStudentUiVersion` lives here — each version
 * branch owns its own `useAudioQuiz` call.
 *
 * Always the Custom Quiz audio path — `ReviewMyFlashcardsAudioQuiz` is the
 * My Flashcards equivalent — so the v2 screen's `quizCategory` is fixed
 * rather than threaded through as a prop.
 */
export function RegularAudioQuiz({
  audioQuizProps,
}: RegularAudioQuizProps): JSX.Element {
  const { version } = useStudentUiVersion('ui.student.audioquiz.v2');

  return version === 'v2' ? (
    <RegularAudioQuizV2 audioQuizProps={audioQuizProps} />
  ) : (
    <RegularAudioQuizV1 audioQuizProps={audioQuizProps} />
  );
}

function RegularAudioQuizV1({
  audioQuizProps,
}: RegularAudioQuizProps): JSX.Element {
  const audioQuizReturn = useAudioQuiz(audioQuizProps);
  return <AudioQuiz audioQuizReturn={audioQuizReturn} />;
}

function RegularAudioQuizV2({
  audioQuizProps,
}: RegularAudioQuizProps): JSX.Element {
  const audioQuizReturn = useAudioQuiz(audioQuizProps);
  return (
    <AudioQuizV2Screen
      audioQuizReturn={audioQuizReturn}
      quizCategory="custom"
    />
  );
}
