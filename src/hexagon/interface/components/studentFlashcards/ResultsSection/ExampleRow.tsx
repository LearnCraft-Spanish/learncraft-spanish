import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { DataTableRow } from '@interface/components/general/DataTable/DataTable';
import type {
  ExampleWithVocabulary,
  Vocabulary,
} from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Checkbox } from '@interface/components/general/Checkbox/Checkbox';
import { Chip } from '@interface/components/general/Chip/Chip';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useEffect } from 'react';
import styles from './ExampleRow.module.scss';

export type PlayingClip = `${number}:es` | `${number}:en`;

export interface ExampleRowModel {
  example: ExampleWithVocabulary;
  selected: boolean;
  expanded: boolean;
  playing: PlayingClip | null;
  openVocabId: number | null;
  studentFlashcards: UseStudentFlashcardsReturn;
  lessonPopup: LessonPopup;
  onToggleSelected: (exampleId: number, selected: boolean) => void;
  onToggleExpanded: (exampleId: number) => void;
  onTogglePlay: (clip: PlayingClip, url: string) => void;
  onToggleVocab: (vocabId: number) => void;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Split a Spanish sentence around the first vocabulary word that appears in it. */
export function splitOnTargetWord(
  spanish: string,
  vocabulary: Vocabulary[],
): { pre: string; word: string; post: string } | null {
  const candidates = vocabulary
    .flatMap((item) => [item.word, ...item.spellings])
    .filter((item) => item.length > 0)
    .sort((a, b) => b.length - a.length);

  for (const candidate of candidates) {
    const pattern = new RegExp(
      `(^|[^\\p{L}])(${escapeRegExp(candidate)})(?=[^\\p{L}]|$)`,
      'iu',
    );
    const match = pattern.exec(spanish);
    if (match === null) {
      continue;
    }
    const capturedWord = match[2] as string;
    const wordStart = match.index + (match[1] as string).length;
    return {
      pre: spanish.slice(0, wordStart),
      word: spanish.slice(wordStart, wordStart + capturedWord.length),
      post: spanish.slice(wordStart + capturedWord.length),
    };
  }

  return null;
}

export function SpanishSentence({
  spanish,
  vocabulary,
}: {
  spanish: string;
  vocabulary: Vocabulary[];
}): JSX.Element {
  const parts = splitOnTargetWord(spanish, vocabulary);

  if (parts === null) {
    return <span className={styles.sentence}>{spanish}</span>;
  }

  return (
    <span className={styles.sentence}>
      {parts.pre}
      <strong className={styles.targetWord}>{parts.word}</strong>
      {parts.post}
    </span>
  );
}

function SpanishCell({
  example,
  playing,
  onTogglePlay,
}: {
  example: ExampleWithVocabulary;
  playing: PlayingClip | null;
  onTogglePlay: (clip: PlayingClip, url: string) => void;
}): JSX.Element {
  const clip: PlayingClip = `${example.id}:es`;

  return (
    <div className={styles.sentenceCell}>
      <IconButton
        icon="volume"
        label="Play Spanish"
        variant="bare"
        size="fit"
        iconSize="md"
        tone="muted"
        active={playing === clip}
        onClick={() => {
          onTogglePlay(clip, example.spanishAudio);
        }}
      />
      <SpanishSentence
        spanish={example.spanish}
        vocabulary={example.vocabulary}
      />
    </div>
  );
}

function EnglishCell({
  example,
  playing,
  onTogglePlay,
}: {
  example: ExampleWithVocabulary;
  playing: PlayingClip | null;
  onTogglePlay: (clip: PlayingClip, url: string) => void;
}): JSX.Element {
  const clip: PlayingClip = `${example.id}:en`;

  return (
    <div className={styles.sentenceCell}>
      <IconButton
        icon="volume"
        label="Play English"
        variant="bare"
        size="fit"
        iconSize="md"
        tone="muted"
        active={playing === clip}
        onClick={() => {
          onTogglePlay(clip, example.englishAudio);
        }}
      />
      <span className={styles.sentence}>{example.english}</span>
    </div>
  );
}

function ActionsCell({
  example,
  expanded,
  studentFlashcards,
  onToggleExpanded,
}: {
  example: ExampleWithVocabulary;
  expanded: boolean;
  studentFlashcards: UseStudentFlashcardsReturn;
  onToggleExpanded: (exampleId: number) => void;
}): JSX.Element {
  const collected = studentFlashcards.isExampleCollected({
    exampleId: example.id,
  });
  const pending =
    studentFlashcards.isAddingFlashcard({ exampleId: example.id }) ||
    studentFlashcards.isRemovingFlashcard({ exampleId: example.id });

  return (
    <div className={styles.actions}>
      <span className={styles.expandToggle}>
        <IconButton
          icon={expanded ? 'chevronUp' : 'chevronDown'}
          label={expanded ? 'Collapse row' : 'Expand row'}
          variant="bare"
          size="fit"
          iconSize="md"
          tone={expanded ? 'action' : 'muted'}
          active={expanded}
          onClick={() => {
            onToggleExpanded(example.id);
          }}
        />
      </span>
      {collected ? (
        <span className={styles.inSetAction}>
          <Button
            variant="ghost"
            muted
            size="sm"
            disabled={pending}
            onClick={() => {
              void studentFlashcards.deleteFlashcards([example.id]);
            }}
          >
            In set
          </Button>
        </span>
      ) : (
        <span className={styles.addAction}>
          <Button
            variant="primary"
            size="sm"
            disabled={pending}
            onClick={() => {
              void studentFlashcards.createFlashcards([example]);
            }}
          >
            Add
          </Button>
        </span>
      )}
    </div>
  );
}

function VocabDetail({
  exampleId,
  vocabulary,
  lessonPopup,
}: {
  exampleId: number;
  vocabulary: Vocabulary;
  lessonPopup: LessonPopup;
}): JSX.Element {
  const { openContextual, closeContextual } = useContextualMenu();

  useEffect(() => {
    openContextual(`vocabInfo-${exampleId}-${vocabulary.id}`);
    return () => {
      closeContextual();
    };
  }, [closeContextual, exampleId, openContextual, vocabulary.id]);

  const firstLesson = [...lessonPopup.lessonsByVocabulary].sort(
    (left, right) => left.lessonNumber - right.lessonNumber,
  )[0];

  return (
    <div className={styles.vocabDetail}>
      <Eyebrow>{`\u201C${vocabulary.word}\u201D first taught in`}</Eyebrow>
      {lessonPopup.lessonsLoading && (
        <p className={styles.vocabLesson}>Loading…</p>
      )}
      {!lessonPopup.lessonsLoading && firstLesson !== undefined && (
        <>
          <p className={styles.vocabLesson}>
            Lesson {firstLesson.lessonNumber}
          </p>
          <p className={styles.vocabUnit}>{firstLesson.courseName}</p>
        </>
      )}
      {!lessonPopup.lessonsLoading && firstLesson === undefined && (
        <p className={styles.vocabUnit}>No lessons found</p>
      )}
    </div>
  );
}

export function ExampleExpandPanel({
  example,
  openVocabId,
  lessonPopup,
  studentFlashcards,
  onToggleVocab,
}: {
  example: ExampleWithVocabulary;
  openVocabId: number | null;
  lessonPopup: LessonPopup;
  studentFlashcards: UseStudentFlashcardsReturn;
  onToggleVocab: (vocabId: number) => void;
}): JSX.Element {
  const openVocab =
    openVocabId === null
      ? undefined
      : example.vocabulary.find((item) => item.id === openVocabId);
  const isSpanglish = example.spanglish;
  const isAudio = example.spanishAudio.length > 0;
  const isCustom = studentFlashcards.isCustomFlashcard({
    exampleId: example.id,
  });
  const hasSpecial = isSpanglish || isAudio || isCustom;

  return (
    <div className={styles.expandPanel}>
      <div>
        <div className={styles.columnEyebrow}>
          <Eyebrow as="h3">Vocabulary tags</Eyebrow>
        </div>
        {example.vocabulary.length > 0 && (
          <div className={styles.chipRow}>
            {example.vocabulary.map((item) => (
              <span className={styles.vocabChip} key={item.id}>
                <Chip
                  label={item.word}
                  tone="label"
                  selected={openVocabId === item.id}
                  selectedSkin="navy"
                  onSelect={() => {
                    onToggleVocab(item.id);
                  }}
                />
              </span>
            ))}
          </div>
        )}
        {openVocab === undefined && example.vocabulary.length > 0 && (
          <p className={styles.hint}>Click a tag to see where it's taught.</p>
        )}
        {openVocab !== undefined && (
          <VocabDetail
            exampleId={example.id}
            vocabulary={openVocab}
            lessonPopup={lessonPopup}
          />
        )}
      </div>
      <div>
        <div className={styles.columnEyebrow}>
          <Eyebrow as="h3">Special tags</Eyebrow>
        </div>
        {hasSpecial ? (
          <div className={styles.chipRow}>
            {isSpanglish && (
              <span className={`${styles.specialChip} ${styles.smokeChip}`}>
                <Chip label="Spanglish" tone="label" icon="language" />
              </span>
            )}
            {isAudio && (
              <span className={styles.specialChip}>
                <Chip label="Audio flashcard" tone="action" icon="volume" />
              </span>
            )}
            {isCustom && (
              <span className={styles.specialChip}>
                <Chip label="Custom flashcard" tone="warning" icon="userStar" />
              </span>
            )}
          </div>
        ) : (
          <p className={styles.emptySpecial}>
            No special tags on this flashcard.
          </p>
        )}
      </div>
    </div>
  );
}

export function buildExampleRow(model: ExampleRowModel): DataTableRow {
  const { example } = model;

  return {
    id: String(example.id),
    selected: model.selected,
    expanded: model.expanded,
    cells: [
      <Checkbox
        id={`select-example-${example.id}`}
        key="select"
        checked={model.selected}
        label={`Select example ${example.id}`}
        labelHidden
        onChange={(checked) => {
          model.onToggleSelected(example.id, checked);
        }}
      />,
      <SpanishCell
        key="spanish"
        example={example}
        playing={model.playing}
        onTogglePlay={model.onTogglePlay}
      />,
      <EnglishCell
        key="english"
        example={example}
        playing={model.playing}
        onTogglePlay={model.onTogglePlay}
      />,
      <ActionsCell
        key="actions"
        example={example}
        expanded={model.expanded}
        studentFlashcards={model.studentFlashcards}
        onToggleExpanded={model.onToggleExpanded}
      />,
    ],
    expandPanel: (
      <ExampleExpandPanel
        example={example}
        openVocabId={model.expanded ? model.openVocabId : null}
        lessonPopup={model.lessonPopup}
        studentFlashcards={model.studentFlashcards}
        onToggleVocab={model.onToggleVocab}
      />
    ),
  };
}
