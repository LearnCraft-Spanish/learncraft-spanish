import type { AudioModeOptionsProps } from '@interface/components/customQuiz/QuizOptionsCard/AudioModeOptions';
import type { QuizLengthFieldProps } from '@interface/components/customQuiz/QuizOptionsCard/QuizLengthField';
import type { JSX } from 'react';
import { AudioModeOptions } from '@interface/components/customQuiz/QuizOptionsCard/AudioModeOptions';
import { QuizLengthField } from '@interface/components/customQuiz/QuizOptionsCard/QuizLengthField';
import { Card } from '@interface/components/general/Card/Card';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import styles from './QuizOptionsCard.module.scss';

export type AudioQuizOptionsCardProps = AudioModeOptionsProps &
  QuizLengthFieldProps;

/**
 * `QuizOptionsCard` for an audio-only quiz: the same audio options and
 * length field, with no quiz type choice above them.
 */
export function AudioQuizOptionsCard({
  idPrefix,
  audioQuizType,
  onAudioQuizTypeChange,
  autoplay,
  onAutoplayChange,
  quizLength,
  quizLengthOptions,
  onQuizLengthChange,
  countLabel,
}: AudioQuizOptionsCardProps): JSX.Element {
  return (
    <Card>
      <div className={styles.root}>
        <Eyebrow as="h2">Audio quiz type</Eyebrow>

        <div className={styles.options}>
          <div className={styles.switches}>
            <AudioModeOptions
              idPrefix={idPrefix}
              audioQuizType={audioQuizType}
              onAudioQuizTypeChange={onAudioQuizTypeChange}
              autoplay={autoplay}
              onAutoplayChange={onAutoplayChange}
            />
          </div>

          <QuizLengthField
            idPrefix={idPrefix}
            quizLength={quizLength}
            quizLengthOptions={quizLengthOptions}
            onQuizLengthChange={onQuizLengthChange}
            countLabel={countLabel}
          />
        </div>
      </div>
    </Card>
  );
}
