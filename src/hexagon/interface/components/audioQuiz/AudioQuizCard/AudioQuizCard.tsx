import type { AddPendingRemoveProps } from '@application/units/useTextQuiz';
import type { AudioQuizBodyKind } from '@domain/functions/audioQuizCopy';
import type { JSX, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { audioQuizTextRuns } from '@domain/functions/audioQuizCopy';
import { AudioQuizPlayButton } from '@interface/components/audioQuiz/AudioQuizPlayButton';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './AudioQuizCard.module.scss';

interface AudioQuizCardProps {
  /** Gates both the fill and whether the card is tappable at all. */
  autoplay: boolean;
  /** 0–100. Rendered as the card's left-to-right fill only when `autoplay`. */
  progressStatus: number;
  bodyKind: AudioQuizBodyKind;
  /** Non-null only when `bodyKind !== 'sentence'`. */
  instructionTitle: string | null;
  /** The current step's sentence text — only read when `bodyKind === 'sentence'`. */
  displayText: string;
  /** Answer step only. Reserves the header row's height either way. */
  isAnswerStep: boolean;
  /** Undefined for non-students, who cannot favourite a card. */
  addPendingRemoveProps?: AddPendingRemoveProps;
  /** Answer step, vocabulary fully tagged. */
  showHelpButton: boolean;
  helpOpen: boolean;
  onToggleHelp: () => void;
  /** `WordChips` (+ the selected `WordPanel`), rendered under the sentence. */
  helpContent?: ReactNode;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  /** Tap-to-advance — only wired to the card when `autoplay` is false. */
  onAdvance: () => void;
}

function stopPropagation(event: MouseEvent): void {
  event.stopPropagation();
}

/** Top-right pill toggling the current card in the student's flashcards. */
function AddToFlashcardsPill({
  addPendingRemoveProps,
}: {
  addPendingRemoveProps: AddPendingRemoveProps;
}): JSX.Element {
  const { isCollected, isAdding, isRemoving, addFlashcard, removeFlashcard } =
    addPendingRemoveProps;
  const isPending = isAdding || isRemoving;

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    if (isCollected) {
      removeFlashcard();
    } else {
      addFlashcard();
    }
  }

  return (
    <button
      type="button"
      className={
        isCollected ? `${styles.addPill} ${styles.added}` : styles.addPill
      }
      onClick={handleClick}
      disabled={isPending}
    >
      <Icon name={isCollected ? 'check' : 'plus'} size="sm" tone="inherit" />
      {isCollected ? 'In my flashcards' : 'Add to my flashcards'}
    </button>
  );
}

/**
 * The white card. Its body is one of three things (never combined, except
 * the help panel which renders below the Answer step's sentence): the
 * flashcard sentence, the `Make a Guess!` / "… audio playing" instruction
 * line, or — with help open on the Answer step — the sentence plus
 * `helpContent` beneath it. Clicking anywhere on the card advances the
 * step, but only when `autoplay` is off (handoff: "Tapping the card does
 * nothing" while autoplay drives steps on its own); nested controls
 * (`stopPropagation`) never trigger that advance.
 */
export function AudioQuizCard({
  autoplay,
  progressStatus,
  bodyKind,
  instructionTitle,
  displayText,
  isAnswerStep,
  addPendingRemoveProps,
  showHelpButton,
  helpOpen,
  onToggleHelp,
  helpContent,
  isPlaying,
  onPlay,
  onPause,
  onAdvance,
}: AudioQuizCardProps): JSX.Element {
  const tappable = !autoplay;

  function handleClick(): void {
    if (tappable) {
      onAdvance();
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onAdvance();
    }
  }

  return (
    <div
      role={tappable ? 'button' : undefined}
      tabIndex={tappable ? 0 : undefined}
      aria-label={tappable ? 'Flashcard. Press to advance.' : undefined}
      className={[
        styles.root,
        tappable ? styles.tappable : null,
        helpOpen ? styles.helpOpen : null,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      onKeyDown={tappable ? handleKeyDown : undefined}
    >
      {autoplay && (
        <div className={styles.fill} style={{ width: `${progressStatus}%` }} />
      )}

      <div className={styles.header} onClick={stopPropagation}>
        {isAnswerStep && addPendingRemoveProps && (
          <AddToFlashcardsPill addPendingRemoveProps={addPendingRemoveProps} />
        )}
      </div>

      <div
        className={helpOpen ? `${styles.body} ${styles.helpOpen}` : styles.body}
      >
        {bodyKind === 'sentence' ? (
          <p className={styles.sentence}>
            {audioQuizTextRuns(displayText).map((run, index) => (
              <span
                key={index}
                className={run.bold ? styles.bold : styles.regular}
              >
                {run.text}
              </span>
            ))}
          </p>
        ) : (
          <p className={styles.instruction}>{instructionTitle}</p>
        )}

        {helpOpen && helpContent && (
          <div className={styles.helpContent} onClick={stopPropagation}>
            {helpContent}
          </div>
        )}
      </div>

      <div className={styles.footer} onClick={stopPropagation}>
        {showHelpButton && (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={helpOpen ? 'x' : 'book'}
            onClick={onToggleHelp}
          >
            {helpOpen ? 'Hide help' : 'Get help'}
          </Button>
        )}
        <span className={styles.playSlot}>
          <AudioQuizPlayButton
            isPlaying={isPlaying}
            onPlay={onPlay}
            onPause={onPause}
          />
        </span>
      </div>
    </div>
  );
}
