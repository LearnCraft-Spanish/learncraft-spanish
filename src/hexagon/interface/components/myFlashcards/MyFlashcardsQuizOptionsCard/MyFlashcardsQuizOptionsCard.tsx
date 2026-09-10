import type { AudioQuizSetupReturn } from '@application/units/useAudioQuizSetup';
import type { TextQuizSetupReturn } from '@application/units/useTextQuizSetup';
import type { JSX } from 'react';
import { MyFlashcardsQuizType } from '@application/useCases/useQuizMyFlashcards';
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
import styles from './MyFlashcardsQuizOptionsCard.module.scss';

export interface MyFlashcardsQuizOptionsCardProps {
  onQuizTypeChange: (type: MyFlashcardsQuizType) => void;
  isAudioQuiz: boolean;
  textQuizSetup: TextQuizSetupReturn;
  audioQuizSetup: AudioQuizSetupReturn;
  countLabel: string;
  /** Shows an "updating" state instead of the count while filters resolve. */
  filteringIsLoading?: boolean;
}

const CUSTOM_FLASHCARD_OPTIONS = [
  { value: 'included', label: 'Included' },
  { value: 'onlyCustom', label: 'Only custom' },
  { value: 'excluded', label: 'Excluded' },
];

function isCustomFlashcardsChoice(
  value: string,
): value is 'included' | 'onlyCustom' | 'excluded' {
  return value === 'included' || value === 'onlyCustom' || value === 'excluded';
}

/**
 * Quiz type, its type-specific options, and the length select — the My
 * Flashcards sibling of `customQuiz/QuizOptionsCard`. The two cards diverge
 * because the underlying quiz types differ (SRS + custom-flashcards choice
 * here, no course/lesson scope; exclude-Spanglish + audio mode there), but
 * they share every primitive: `Card`, `SelectorCard`, `Toggle`, `Field`,
 * `Select`.
 */
export function MyFlashcardsQuizOptionsCard({
  onQuizTypeChange,
  isAudioQuiz,
  textQuizSetup,
  audioQuizSetup,
  countLabel,
  filteringIsLoading = false,
}: MyFlashcardsQuizOptionsCardProps): JSX.Element {
  const {
    canAccessSRS,
    canAccessCustom,
    srsQuiz,
    setSrsQuiz,
    startWithSpanish,
    setStartWithSpanish,
    customFlashcardsChoice,
    setCustomFlashcardsChoice,
    quizLength: textQuizLength,
    availableQuizLengths: textQuizLengthOptions,
    setSelectedQuizLength: setTextQuizLength,
  } = textQuizSetup;

  const {
    audioQuizType,
    setAudioQuizType,
    autoplay,
    setAutoplay,
    selectedQuizLength: audioQuizLength,
    availableQuizLengths: audioQuizLengthOptions,
    setSelectedQuizLength: setAudioQuizLength,
  } = audioQuizSetup;

  const quizLength = isAudioQuiz ? audioQuizLength : textQuizLength;
  const quizLengthOptions = isAudioQuiz
    ? audioQuizLengthOptions
    : textQuizLengthOptions;
  const onQuizLengthChange = isAudioQuiz
    ? setAudioQuizLength
    : setTextQuizLength;

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
            selected={!isAudioQuiz}
            onSelect={() => onQuizTypeChange(MyFlashcardsQuizType.Text)}
          />
          <SelectorCard
            icon="volume"
            label="Audio"
            selected={isAudioQuiz}
            onSelect={() => onQuizTypeChange(MyFlashcardsQuizType.Audio)}
          />
        </div>

        <div className={styles.options}>
          <div className={styles.switches}>
            {isAudioQuiz ? (
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
                    onSelect={() => setAudioQuizType(AudioQuizType.Speaking)}
                  />
                  <SelectorCard
                    icon="headphones"
                    label="Listening"
                    variant="compactTile"
                    selected={audioQuizType === AudioQuizType.Listening}
                    onSelect={() => setAudioQuizType(AudioQuizType.Listening)}
                  />
                </div>
                <Toggle
                  id="my-flashcards-autoplay"
                  checked={autoplay}
                  onChange={setAutoplay}
                  label="Autoplay"
                />
              </>
            ) : (
              <>
                {canAccessSRS && (
                  <Toggle
                    id="my-flashcards-srs"
                    checked={srsQuiz}
                    onChange={setSrsQuiz}
                    label="SRS quiz"
                  />
                )}
                <Toggle
                  id="my-flashcards-spanish-first"
                  checked={startWithSpanish}
                  onChange={setStartWithSpanish}
                  label="Start with Spanish"
                />
                {canAccessCustom && (
                  <Field
                    htmlFor="my-flashcards-custom"
                    label="Custom flashcards"
                  >
                    <Select
                      id="my-flashcards-custom"
                      value={customFlashcardsChoice}
                      options={CUSTOM_FLASHCARD_OPTIONS}
                      onChange={(value) => {
                        if (isCustomFlashcardsChoice(value)) {
                          setCustomFlashcardsChoice(value);
                        }
                      }}
                    />
                  </Field>
                )}
              </>
            )}
          </div>

          <div>
            <Field htmlFor="my-flashcards-length" label="Quiz length">
              <Select
                id="my-flashcards-length"
                value={String(quizLength)}
                options={quizLengthOptions.map((option) => ({
                  value: String(option),
                  label: option.toLocaleString('en-US'),
                }))}
                onChange={(value) => onQuizLengthChange(Number(value))}
              />
            </Field>
            <p className={styles.count}>
              {filteringIsLoading ? 'Updating results…' : countLabel}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
