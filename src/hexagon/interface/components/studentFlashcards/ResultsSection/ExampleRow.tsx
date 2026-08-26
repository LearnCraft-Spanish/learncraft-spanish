import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { FlashcardReviewDates } from '@domain/functions/formatFlashcardReviewDates';
import type { DataTableRow } from '@interface/components/general/DataTable/DataTable';
import type {
  ExampleWithVocabulary,
  Vocabulary,
} from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import { formatFlashcardReviewDates } from '@domain/functions/formatFlashcardReviewDates';
import { splitSpanishTextRuns } from '@domain/functions/splitSpanishTextRuns';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Checkbox } from '@interface/components/general/Checkbox/Checkbox';
import { Chip } from '@interface/components/general/Chip/Chip';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import { Popover } from '@interface/components/general/Popover/Popover';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useEffect } from 'react';
import styles from './ExampleRow.module.scss';

export type PlayingClip = `${number}:es` | `${number}:en`;

/**
 * `collect` is the finder: Collect on a catalog example, Owned once it is in
 * the collection. `remove` is the manager, where every row is already owned
 * and the only row action is taking it back out.
 */
export type ExampleRowAction = 'collect' | 'remove';

export interface ExampleRowModel {
  example: ExampleWithVocabulary;
  selected: boolean;
  expanded: boolean;
  playing: PlayingClip | null;
  openVocabId: number | null;
  studentFlashcards: UseStudentFlashcardsReturn;
  lessonPopup: LessonPopup;
  rowAction?: ExampleRowAction;
  /** Review dates for the expand panel. Omitted on the finder. */
  reviewSchedule?: FlashcardReviewDates;
  /**
   * Fired just before a row Remove deletes the row that holds the button, so
   * the caller can take focus somewhere that survives. Never runs under the
   * `collect` action, whose cell swaps Collect for Owned in place.
   */
  onRemoveRequested?: () => void;
  onToggleSelected: (exampleId: number, selected: boolean) => void;
  onToggleExpanded: (exampleId: number) => void;
  onTogglePlay: (clip: PlayingClip, url: string) => void;
  onToggleVocab: (vocabId: number) => void;
}

export function SpanishSentence({ spanish }: { spanish: string }): JSX.Element {
  const runs = splitSpanishTextRuns(spanish);

  return (
    <span className={styles.sentence}>
      {runs.map((run, index) => (
        <span
          key={`${index}-${run.text}`}
          className={run.english ? styles.embeddedEnglish : styles.spanishRun}
        >
          {run.text}
        </span>
      ))}
    </span>
  );
}

function hasAudioLink(url: string): boolean {
  return url.length > 0;
}

/** Long enough to tell two rows apart, short enough for a rotor listing. */
const ROW_LABEL_MAX_LENGTH = 60;

/**
 * Names a row's controls by what the row says, so a rotor listing reads as
 * sentences rather than 25 copies of "Expand row". Asterisk markers around
 * embedded English are dropped, and an example with no Spanish falls back to
 * its id so the name is never empty.
 */
export function exampleRowLabel(example: ExampleWithVocabulary): string {
  const text = splitSpanishTextRuns(example.spanish)
    .map((run) => run.text)
    .join('')
    .trim();

  if (text.length === 0) {
    return `example ${example.id}`;
  }
  if (text.length <= ROW_LABEL_MAX_LENGTH) {
    return text;
  }
  return `${text.slice(0, ROW_LABEL_MAX_LENGTH).trimEnd()}…`;
}

/**
 * A row action swallows a rejected mutation because the row has no notice
 * channel of its own. What the student sees depends on which rejection it is:
 * `useFlashcardsQuery` toasts a failed create or delete from the mutation's
 * `onError`, but its access guards (no student role) only `console.error` and
 * reject, so that path is silent by design. Without a handler either one would
 * go unhandled — `void` alone silences the lint rule, not the runtime.
 */
function ignoreRowActionRejection(): void {}

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
      {hasAudioLink(example.spanishAudio) && (
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
      )}
      <SpanishSentence spanish={example.spanish} />
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
      {hasAudioLink(example.englishAudio) && (
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
      )}
      <span className={styles.sentence}>{example.english}</span>
    </div>
  );
}

function ActionsCell({
  example,
  expanded,
  studentFlashcards,
  rowAction,
  onToggleExpanded,
  onRemoveRequested,
}: {
  example: ExampleWithVocabulary;
  expanded: boolean;
  studentFlashcards: UseStudentFlashcardsReturn;
  rowAction: ExampleRowAction;
  onToggleExpanded: (exampleId: number) => void;
  onRemoveRequested?: () => void;
}): JSX.Element {
  const collected = studentFlashcards.isExampleCollected({
    exampleId: example.id,
  });
  const removing = studentFlashcards.isRemovingFlashcard({
    exampleId: example.id,
  });
  const pending =
    studentFlashcards.isAddingFlashcard({ exampleId: example.id }) || removing;

  const rowLabel = exampleRowLabel(example);

  const expandToggle = (
    <span className={styles.expandToggle}>
      <IconButton
        icon={expanded ? 'chevronUp' : 'chevronDown'}
        label={
          expanded ? `Collapse row: ${rowLabel}` : `Expand row: ${rowLabel}`
        }
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
  );

  if (rowAction === 'remove') {
    return (
      <div className={styles.actions}>
        {expandToggle}
        <span className={styles.removeAction}>
          <Button
            variant="ghost"
            muted
            size="sm"
            disabled={pending}
            onClick={() => {
              // This button is about to be disabled and then unmounted with
              // its row, either of which drops focus to <body>. Hand it over
              // before starting the removal.
              onRemoveRequested?.();
              studentFlashcards
                .deleteFlashcards([example.id])
                .catch(ignoreRowActionRejection);
            }}
          >
            {removing ? 'Removing...' : 'Remove'}
          </Button>
        </span>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      {expandToggle}
      {collected ? (
        <span className={styles.ownedAction}>
          <Button
            variant="ghost"
            muted
            size="sm"
            disabled={pending}
            onClick={() => {
              studentFlashcards
                .deleteFlashcards([example.id])
                .catch(ignoreRowActionRejection);
            }}
          >
            Owned
          </Button>
        </span>
      ) : (
        <span className={styles.collectAction}>
          <Button
            variant="primary"
            size="sm"
            disabled={pending}
            onClick={() => {
              studentFlashcards
                .createFlashcards([example])
                .catch(ignoreRowActionRejection);
            }}
          >
            Collect
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

  return (
    <div className={styles.vocabDetail}>
      <p className={styles.vocabWord}>{vocabulary.word}</p>
      <p className={styles.vocabDescriptor}>{vocabulary.descriptor}</p>
      <div className={styles.vocabMeta}>
        <p>Part of Speech: {vocabulary.subcategory.partOfSpeech}</p>
        {vocabulary.type === 'verb' ? (
          <>
            <p>Verb Infinitive: {vocabulary.verb.infinitive}</p>
            {vocabulary.conjugationTags.length > 0 && (
              <p>Conjugation Notes: {vocabulary.conjugationTags.join(', ')}</p>
            )}
          </>
        ) : (
          <p>Category: {vocabulary.subcategory.category}</p>
        )}
      </div>
      <div className={styles.taughtIn}>
        <Eyebrow tone="onDark">Taught in</Eyebrow>
        {lessonPopup.lessonsLoading && (
          <p className={styles.vocabLesson}>Loading…</p>
        )}
        {!lessonPopup.lessonsLoading &&
          lessonPopup.lessonsByVocabulary.length === 0 && (
            <p className={styles.vocabUnit}>No lessons found</p>
          )}
        {!lessonPopup.lessonsLoading &&
          lessonPopup.lessonsByVocabulary.length > 0 && (
            <ul className={styles.vocabLessonList}>
              {lessonPopup.lessonsByVocabulary.map((lesson) => {
                const isCurrentCourse =
                  lessonPopup.currentCourseName != null &&
                  lesson.courseName === lessonPopup.currentCourseName;

                return (
                  <li
                    className={
                      isCurrentCourse
                        ? styles.vocabLessonItemCurrent
                        : undefined
                    }
                    key={lesson.id}
                  >
                    <p className={styles.vocabLesson}>
                      Lesson {lesson.lessonNumber}
                    </p>
                    <p className={styles.vocabUnit}>{lesson.courseName}</p>
                  </li>
                );
              })}
            </ul>
          )}
      </div>
    </div>
  );
}

function ReviewScheduleColumn({
  reviewSchedule,
}: {
  reviewSchedule: FlashcardReviewDates;
}): JSX.Element {
  const dates = formatFlashcardReviewDates(reviewSchedule);

  return (
    <div>
      <div className={styles.columnEyebrow}>
        <Eyebrow as="h3">Review schedule</Eyebrow>
      </div>
      <dl className={styles.dateList}>
        <div className={styles.dateRow}>
          <dt className={styles.dateLabel}>Added on:</dt>
          <dd className={styles.dateValue}>{dates.addedOn}</dd>
        </div>
        <div className={styles.dateRow}>
          <dt className={styles.dateLabel}>Last Reviewed:</dt>
          <dd className={styles.dateValue}>{dates.lastReviewed}</dd>
        </div>
        <div className={styles.dateRow}>
          <dt className={styles.dateLabel}>Next SRS Review:</dt>
          <dd className={styles.dateValue}>{dates.nextReview}</dd>
        </div>
      </dl>
    </div>
  );
}

export interface ExampleExpandPanelProps {
  example: ExampleWithVocabulary;
  openVocabId: number | null;
  lessonPopup: LessonPopup;
  studentFlashcards: UseStudentFlashcardsReturn;
  /** Adds the review-schedule column. Omitted on the finder. */
  reviewSchedule?: FlashcardReviewDates;
  onToggleVocab: (vocabId: number) => void;
}

export function ExampleExpandPanel({
  example,
  openVocabId,
  lessonPopup,
  studentFlashcards,
  reviewSchedule,
  onToggleVocab,
}: ExampleExpandPanelProps): JSX.Element {
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
              <Popover
                key={item.id}
                open={openVocabId === item.id}
                onDismiss={() => {
                  if (openVocabId === item.id) {
                    onToggleVocab(item.id);
                  }
                }}
                skin="dark"
                trigger={
                  <span className={styles.vocabChip}>
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
                }
              >
                <VocabDetail
                  exampleId={example.id}
                  vocabulary={item}
                  lessonPopup={lessonPopup}
                />
              </Popover>
            ))}
          </div>
        )}
        {openVocab === undefined && example.vocabulary.length > 0 && (
          <p className={styles.hint}>Click a tag to see where it's taught.</p>
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
      {reviewSchedule !== undefined && (
        <ReviewScheduleColumn reviewSchedule={reviewSchedule} />
      )}
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
        label={`Select ${exampleRowLabel(example)}`}
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
        rowAction={model.rowAction ?? 'collect'}
        onToggleExpanded={model.onToggleExpanded}
        onRemoveRequested={model.onRemoveRequested}
      />,
    ],
    expandPanel: (
      <ExampleExpandPanel
        example={example}
        openVocabId={model.expanded ? model.openVocabId : null}
        lessonPopup={model.lessonPopup}
        studentFlashcards={model.studentFlashcards}
        reviewSchedule={model.reviewSchedule}
        onToggleVocab={model.onToggleVocab}
      />
    ),
  };
}
