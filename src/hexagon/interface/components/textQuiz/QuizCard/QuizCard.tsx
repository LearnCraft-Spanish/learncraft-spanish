import type { SrsDifficulty } from '@domain/srs';
import type {
  JSX,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
} from 'react';
import { quizFaceRuns } from '@domain/functions/quizFaceRuns';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import { CardAudioButton } from '@interface/components/textQuiz/CardAudioButton';
import { useEffect, useRef, useState } from 'react';
import styles from './QuizCard.module.scss';

/*
 * Swipe-to-grade constants, taken literally from the interactive prototype
 * (`Quiz Card Redesign.dc.html`) rather than the design token scale:
 * - 80px is the distance past which a drag commits to a grade.
 * - 6px is the distance past which a drag suppresses tap-to-flip.
 * - 60 is the rotate divisor (`dx / 60` degrees).
 * - 90 is the tint-opacity divisor (`|dx| / 90`, clamped to 1).
 * The tint colors themselves are tokenized — see `QuizCard.module.scss`.
 */
const SWIPE_GRADE_THRESHOLD_PX = 80;
const SWIPE_TAP_THRESHOLD_PX = 6;
const SWIPE_ROTATE_DIVISOR = 60;
const SWIPE_TINT_DIVISOR = 90;

/** Guards the `matchMedia` call, which jsdom does not implement. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

interface QuizCardFace {
  text: string;
  /** Spanish renders through `quizFaceRuns`; English is plain regular text. */
  spanish: boolean;
}

interface QuizCardFavourite {
  isFavourited: boolean;
  isPending: boolean;
  onToggle: () => void;
}

interface QuizCardProps {
  /** Gates swipe-to-grade — the only thing this component branches on. */
  srs: boolean;
  answerShowing: boolean;
  face: QuizCardFace;
  audioUrl: string | null;
  /** Undefined for non-students, who cannot favourite a card. */
  favourite?: QuizCardFavourite;
  /** Answer side only, and only once the vocabulary is fully tagged. */
  showHelpButton: boolean;
  helpOpen: boolean;
  onToggleHelp: () => void;
  hintText: string;
  onFlip: () => void;
  /** `WordChips` (+ the selected `WordPanel`), rendered when help is open. */
  helpContent?: ReactNode;
  /** SRS only. Swiping past the threshold calls this instead of flipping. */
  onGrade?: (difficulty: SrsDifficulty) => void;
}

/**
 * The white card. One card serves both variants; `srs` only gates
 * swipe-to-grade, which engages once the answer is showing. Clicking
 * anywhere on the card flips it, except on a nested button (which stops the
 * click from bubbling before it gets here) or after a drag past the tap
 * threshold (which suppresses the flip that would otherwise follow).
 */
export function QuizCard({
  srs,
  answerShowing,
  face,
  audioUrl,
  favourite,
  showHelpButton,
  helpOpen,
  onToggleHelp,
  hintText,
  onFlip,
  helpContent,
  onGrade,
}: QuizCardProps): JSX.Element {
  const [dx, setDx] = useState(0);
  const dragStartXRef = useRef<number | null>(null);
  const draggedPastTapRef = useRef(false);

  // Neither a flip back to the prompt nor a fresh card should carry over a
  // stale drag offset from the card that was just graded or navigated away
  // from.
  useEffect(() => {
    setDx(0);
  }, [answerShowing, face.text]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    if (!answerShowing) {
      return;
    }
    dragStartXRef.current = event.clientX;
    draggedPastTapRef.current = false;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>): void {
    if (dragStartXRef.current === null) {
      return;
    }
    const nextDx = event.clientX - dragStartXRef.current;
    if (Math.abs(nextDx) > SWIPE_TAP_THRESHOLD_PX) {
      draggedPastTapRef.current = true;
    }
    setDx(nextDx);
  }

  function handlePointerEnd(): void {
    if (dragStartXRef.current === null) {
      return;
    }
    dragStartXRef.current = null;
    if (Math.abs(dx) > SWIPE_GRADE_THRESHOLD_PX) {
      setDx(0);
      onGrade?.(dx > 0 ? 'easy' : 'hard');
      return;
    }
    setDx(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    // Only when the card itself is focused — a keypress bubbling up from a
    // nested button (e.g. a chip) must not also flip the card.
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onFlip();
    }
  }

  function stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  function handleClick(): void {
    // A drag past the tap threshold suppresses the flip that would
    // otherwise fire from the same pointer gesture's trailing click.
    if (draggedPastTapRef.current) {
      draggedPastTapRef.current = false;
      return;
    }
    onFlip();
  }

  const dragHandlers = srs
    ? {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerEnd,
        onPointerCancel: handlePointerEnd,
      }
    : {};

  const dragStyle = srs
    ? {
        transform: `translateX(${dx}px) rotate(${
          prefersReducedMotion() ? 0 : dx / SWIPE_ROTATE_DIVISOR
        }deg)`,
      }
    : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Flashcard, showing the ${
        answerShowing ? 'answer' : 'prompt'
      }. Press to flip.`}
      className={[
        styles.root,
        srs ? styles.swipeable : null,
        helpOpen ? styles.helpOpen : null,
      ]
        .filter(Boolean)
        .join(' ')}
      style={dragStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...dragHandlers}
    >
      {srs && (
        <>
          <div
            className={styles.tintHard}
            style={{ opacity: clamp01(-dx / SWIPE_TINT_DIVISOR) }}
          />
          <div
            className={styles.tintEasy}
            style={{ opacity: clamp01(dx / SWIPE_TINT_DIVISOR) }}
          />
        </>
      )}
      <div className={styles.utilityRow} onClick={stopPropagation}>
        <CardAudioButton audioUrl={audioUrl} label="Play sentence audio" />
        {favourite && (
          /* Handoff: bare Dorado star (no circular fill). `sm` keeps a
           * square 32px hit target near the 34×34 audio tile. Glyph color
           * is forced in `.favourite svg` so it stays Dorado, not steel. */
          <span className={styles.favourite}>
            <IconButton
              icon={favourite.isFavourited ? 'starFilled' : 'star'}
              label={
                favourite.isFavourited
                  ? 'Remove from my flashcards'
                  : 'Add to my flashcards'
              }
              size="sm"
              iconSize="lg"
              tone="muted"
              variant="bare"
              disabled={favourite.isPending}
              onClick={favourite.onToggle}
            />
          </span>
        )}
      </div>

      <div
        className={
          helpOpen ? `${styles.content} ${styles.helpOpen}` : styles.content
        }
      >
        <div className={styles.face}>
          {face.spanish
            ? quizFaceRuns(face.text).map((run, index) => (
                <span
                  key={index}
                  className={run.bold ? styles.bold : styles.regular}
                >
                  {run.text}
                </span>
              ))
            : face.text}
        </div>

        {helpOpen && helpContent && (
          <div className={styles.helpContent} onClick={stopPropagation}>
            {helpContent}
          </div>
        )}
      </div>

      {showHelpButton && (
        <div className={styles.helpButtonRow} onClick={stopPropagation}>
          <Button
            variant="secondary"
            leadingIcon={helpOpen ? 'x' : 'checklist'}
            onClick={onToggleHelp}
          >
            {helpOpen ? 'Hide help' : 'Get help'}
          </Button>
        </div>
      )}

      <p className={styles.hint}>{hintText}</p>
    </div>
  );
}
