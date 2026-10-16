import type { JSX } from 'react';
import { AudioQuizType } from '@domain/audioQuizzing';
import {
  handleRadioGroupKeyDown,
  SelectorCard,
} from '@interface/components/customQuiz/SelectorCard';
import { Toggle } from '@interface/components/general/Toggle/Toggle';
import styles from './QuizOptionsCard.module.scss';

export interface AudioModeOptionsProps {
  /** Prefix for control ids so two instances on one page stay unique. */
  idPrefix: string;
  audioQuizType: AudioQuizType;
  onAudioQuizTypeChange: (value: AudioQuizType) => void;
  autoplay: boolean;
  onAutoplayChange: (value: boolean) => void;
}

/** Speaking / listening pair plus the autoplay switch. */
export function AudioModeOptions({
  idPrefix,
  audioQuizType,
  onAudioQuizTypeChange,
  autoplay,
  onAutoplayChange,
}: AudioModeOptionsProps): JSX.Element {
  return (
    <>
      <div
        className={styles.modes}
        role="radiogroup"
        aria-label="Audio quiz type"
        onKeyDown={handleRadioGroupKeyDown}
      >
        <SelectorCard
          icon="microphone"
          label="Speaking"
          variant="compactTile"
          selected={audioQuizType === AudioQuizType.Speaking}
          onSelect={() => onAudioQuizTypeChange(AudioQuizType.Speaking)}
        />
        <SelectorCard
          icon="headphones"
          label="Listening"
          variant="compactTile"
          selected={audioQuizType === AudioQuizType.Listening}
          onSelect={() => onAudioQuizTypeChange(AudioQuizType.Listening)}
        />
      </div>
      <Toggle
        id={`${idPrefix}-autoplay`}
        checked={autoplay}
        onChange={onAutoplayChange}
        label="Autoplay"
      />
    </>
  );
}
