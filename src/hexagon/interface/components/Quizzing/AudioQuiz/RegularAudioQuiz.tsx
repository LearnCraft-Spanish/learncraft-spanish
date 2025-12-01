import type { AudioQuizProps } from '@application/units/useAudioQuiz';
import { useAudioQuiz } from '@application/units/useAudioQuiz';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';

export function RegularAudioQuiz({
  audioQuizProps,
}: {
  audioQuizProps: AudioQuizProps;
}) {
  const audioQuizReturn = useAudioQuiz(audioQuizProps);
  return <AudioQuiz audioQuizReturn={audioQuizReturn} />;
}
