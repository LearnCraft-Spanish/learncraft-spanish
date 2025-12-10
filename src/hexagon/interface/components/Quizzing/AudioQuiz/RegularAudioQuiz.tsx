import type { AudioQuizProps } from '@application/units/AudioQuiz/useAudioQuiz';
import { useAudioQuiz } from '@application/units/AudioQuiz/useAudioQuiz';
import AudioQuiz from '@interface/components/Quizzing/AudioQuiz/AudioQuiz';

export function RegularAudioQuiz({
  audioQuizProps,
}: {
  audioQuizProps: AudioQuizProps;
}) {
  const audioQuizReturn = useAudioQuiz(audioQuizProps);
  return <AudioQuiz audioQuizReturn={audioQuizReturn} />;
}
