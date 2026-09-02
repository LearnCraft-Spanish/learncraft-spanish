import type { JSX } from 'react';
import { CustomQuizType } from '@application/useCases/useCustomQuizV2';
import { AudioQuizType } from '@domain/audioQuizzing';
import {
  handleRadioGroupKeyDown,
  SelectorCard,
} from '@interface/components/customQuiz/SelectorCard';
import { Card } from '@interface/components/general/Card/Card';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Field } from '@interface/components/general/Field/Field';
import { Select } from '@interface/components/general/Select/Select';
import { Toggle } from '@interface/components/general/Toggle/Toggle';
import styles from './QuizOptionsCard.module.scss';

export interface QuizOptionsCardProps {
  quizType: CustomQuizType;
  onQuizTypeChange: (type: CustomQuizType) => void;
  startWithSpanish: boolean;
  onStartWithSpanishChange: (value: boolean) => void;
  excludeSpanglish: boolean;
  onExcludeSpanglishChange: (value: boolean) => void;
  audioQuizType: AudioQuizType;
  onAudioQuizTypeChange: (value: AudioQuizType) => void;
  autoplay: boolean;
  onAutoplayChange: (value: boolean) => void;
  quizLength: number;
  quizLengthOptions: readonly number[];
  onQuizLengthChange: (value: number) => void;
  countLabel: string;
}

export function QuizOptionsCard({
  quizType,
  onQuizTypeChange,
  startWithSpanish,
  onStartWithSpanishChange,
  excludeSpanglish,
  onExcludeSpanglishChange,
  audioQuizType,
  onAudioQuizTypeChange,
  autoplay,
  onAutoplayChange,
  quizLength,
  quizLengthOptions,
  onQuizLengthChange,
  countLabel,
}: QuizOptionsCardProps): JSX.Element {
  const isAudio = quizType === CustomQuizType.Audio;

  return (
    <Card>
      <div className={styles.root}>
        <Eyebrow as="h2">Quiz type</Eyebrow>

        <div
          className={styles.types}
          role="radiogroup"
          aria-label="Quiz type"
          onKeyDown={handleRadioGroupKeyDown}
        >
          <SelectorCard
            icon="cards"
            label="Flashcards"
            selected={quizType === CustomQuizType.Flashcards}
            onSelect={() => onQuizTypeChange(CustomQuizType.Flashcards)}
          />
          <SelectorCard
            icon="volume"
            label="Audio"
            selected={isAudio}
            onSelect={() => onQuizTypeChange(CustomQuizType.Audio)}
          />
        </div>

        <div className={styles.options}>
          <div className={styles.switches}>
            {isAudio ? (
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
                    onSelect={() =>
                      onAudioQuizTypeChange(AudioQuizType.Speaking)
                    }
                  />
                  <SelectorCard
                    icon="headphones"
                    label="Listening"
                    variant="compactTile"
                    selected={audioQuizType === AudioQuizType.Listening}
                    onSelect={() =>
                      onAudioQuizTypeChange(AudioQuizType.Listening)
                    }
                  />
                </div>
                <Toggle
                  id="custom-quiz-autoplay"
                  checked={autoplay}
                  onChange={onAutoplayChange}
                  label="Autoplay"
                />
              </>
            ) : (
              <>
                <Toggle
                  id="custom-quiz-spanish-first"
                  checked={startWithSpanish}
                  onChange={onStartWithSpanishChange}
                  label="Start with Spanish"
                />
                <Toggle
                  id="custom-quiz-exclude-spanglish"
                  checked={excludeSpanglish}
                  onChange={onExcludeSpanglishChange}
                  label="Exclude Spanglish"
                />
              </>
            )}
          </div>

          <div>
            <Field htmlFor="custom-quiz-length" label="Quiz length">
              <Select
                id="custom-quiz-length"
                value={String(quizLength)}
                options={quizLengthOptions.map((option) => ({
                  value: String(option),
                  label: option.toLocaleString('en-US'),
                }))}
                onChange={(value) => onQuizLengthChange(Number(value))}
              />
            </Field>
            <p className={styles.count}>{countLabel}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
