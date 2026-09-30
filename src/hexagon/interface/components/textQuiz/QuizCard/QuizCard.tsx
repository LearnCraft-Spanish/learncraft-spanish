import type { SrsDifficulty } from '@domain/srs';
import type { CardAudioHandle } from '@interface/components/textQuiz/CardAudioButton';
import type {
  JSX,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  RefObject,
  TransitionEvent,
} from 'react';
import { quizFaceRuns } from '@domain/functions/quizFaceRuns';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import { CardAudioButton } from '@interface/components/textQuiz/CardAudioButton';
import { QUIZ_CARD_FLIP_MS } from '@interface/hooks/useQuizCardMotion';
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

/** jsdom (and a backgrounded tab) never fires `transitionend`. */
const FLIP_FALLBACK_SLACK_MS = 80;

/** Guards the `matchMedia` call, which jsdom does not implement. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** The rotate term is zeroed under reduced motion; the offset is not. */
function rotateFor(dx: number): number {
  return prefersReducedMotion() ? 0 : dx / SWIPE_ROTATE_DIVISOR;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export interface QuizCardFace {
  text: string;
  /** Spanish renders through `quizFaceRuns`; English is plain regular text. */
  spanish: boolean;
}

interface QuizCardFavourite {
  isFavourited: boolean;
  isPending: boolean;
  onToggle: () => void;
}

/** A card pose: horizontal offset in px plus a 2D rotation. */
export interface QuizCardDrag {
  dx: number;
  rotateDeg: number;
}

export interface QuizCardExitTransform extends QuizCardDrag {
  opacity?: number;
}

export interface QuizCardProps {
  /** Gates swipe-to-grade — the only thing this component branches on. */
  srs: boolean;
  answerShowing: boolean;
  /**
   * Both faces, always rendered back to back so the card can flip between
   * them. Pass both or neither.
   */
  promptFace?: QuizCardFace;
  answerFace?: QuizCardFace;
  /**
   * Legacy single face (whichever side is showing). Used only when
   * `promptFace`/`answerFace` are absent; the side swaps instantly.
   */
  face?: QuizCardFace;
  /** Audio for the showing face; its control renders on that face only. */
  audioUrl: string | null;
  /** Lets the quiz screen toggle this face's audio from Space. */
  audioControlRef?: RefObject<CardAudioHandle | null>;
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
  /**
   * SRS only. When present, a swipe past the threshold calls this instead of
   * `onGrade` and the card holds its drag pose so the parent's fly-out
   * continues from it.
   */
  onSwipeCommit?: (difficulty: SrsDifficulty, drag: QuizCardDrag) => void;
  /** Ignores flip, drag, and grade — e.g. while a stage motion is running. */
  interactionLocked?: boolean;
  /** Parent-driven pose; overrides the drag offset while set. */
  exitTransform?: QuizCardExitTransform | null;
  /** Holds the matching swipe tint at full opacity during a grade exit. */
  exitTint?: 'hard' | 'easy' | null;
}

/**
 * The white card. One card serves both variants; `srs` only gates
 * swipe-to-grade, which engages once the answer is showing. Clicking
 * anywhere on the card flips it, except on a nested button (which stops the
 * click from bubbling before it gets here) or after a drag past the tap
 * threshold (which suppresses the flip that would otherwise follow).
 *
 * The prompt and answer are two plates on a `rotateX` flipper. Question to
 * answer brings the top edge forward; flipping back brings the bottom edge
 * forward. Only a flip of the same card animates;
 * a new card (or reduced motion) swaps sides instantly. The hidden plate
 * is `inert`, so its controls never take focus.
 */
export function QuizCard({
  srs,
  answerShowing,
  promptFace,
  answerFace,
  face,
  audioUrl,
  audioControlRef,
  favourite,
  showHelpButton,
  helpOpen,
  onToggleHelp,
  hintText,
  onFlip,
  helpContent,
  onGrade,
  onSwipeCommit,
  interactionLocked = false,
  exitTransform = null,
  exitTint = null,
}: QuizCardProps): JSX.Element {
  const [dx, setDx] = useState(0);
  const [springingBack, setSpringingBack] = useState(false);
  const [flipAnimating, setFlipAnimating] = useState(false);
  const dragStartXRef = useRef<number | null>(null);
  const draggedPastTapRef = useRef(false);

  const dualFace = promptFace !== undefined && answerFace !== undefined;
  const frontFace = dualFace ? promptFace : answerShowing ? null : face;
  const backFace = dualFace ? answerFace : answerShowing ? face : null;
  const cardKey = dualFace
    ? `${promptFace.text}\u0000${answerFace.text}`
    : (face?.text ?? '');

  // Neither a flip back to the prompt nor a fresh card should carry over a
  // stale drag offset from the card that was just graded or navigated away
  // from. Adjusted during render (not in an effect) so a new card never
  // paints a frame at the old card's pose.
  const [shown, setShown] = useState({ cardKey, answerShowing });
  if (shown.cardKey !== cardKey || shown.answerShowing !== answerShowing) {
    setShown({ cardKey, answerShowing });
    setDx(0);
    setSpringingBack(false);
    setFlipAnimating(shown.cardKey === cardKey && !prefersReducedMotion());
  }

  useEffect(() => {
    if (!flipAnimating) {
      return;
    }
    const timer = setTimeout(() => {
      setFlipAnimating(false);
    }, QUIZ_CARD_FLIP_MS + FLIP_FALLBACK_SLACK_MS);
    return () => clearTimeout(timer);
  }, [flipAnimating]);

  const locked = interactionLocked || flipAnimating;

  function handlePointerDown(event: PointerEvent<HTMLDivElement>): void {
    if (!answerShowing || locked) {
      return;
    }
    dragStartXRef.current = event.clientX;
    draggedPastTapRef.current = false;
    setSpringingBack(false);
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
    if (Math.abs(dx) > SWIPE_GRADE_THRESHOLD_PX && !interactionLocked) {
      const difficulty = dx > 0 ? 'easy' : 'hard';
      if (onSwipeCommit) {
        onSwipeCommit(difficulty, { dx, rotateDeg: rotateFor(dx) });
        return;
      }
      setDx(0);
      onGrade?.(difficulty);
      return;
    }
    if (dx !== 0) {
      setSpringingBack(true);
    }
    setDx(0);
  }

  function handleRootTransitionEnd(
    event: TransitionEvent<HTMLDivElement>,
  ): void {
    if (event.target === event.currentTarget) {
      setSpringingBack(false);
    }
  }

  function handleFlipperTransitionEnd(
    event: TransitionEvent<HTMLDivElement>,
  ): void {
    if (
      event.target === event.currentTarget &&
      event.propertyName === 'transform'
    ) {
      setFlipAnimating(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    // Only when the card itself is focused — a keypress bubbling up from a
    // nested button (e.g. a chip) must not also flip the card.
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.key === ' ') {
      // Space play/pause is handled on the document. Prevent the implicit
      // role=button activation that would otherwise flip the card.
      event.preventDefault();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!locked) {
        onFlip();
      }
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
    if (locked) {
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

  const pose: QuizCardExitTransform | null =
    exitTransform ?? (srs ? { dx, rotateDeg: rotateFor(dx) } : null);
  const poseStyle = pose
    ? {
        transform: `translateX(${pose.dx}px) rotate(${pose.rotateDeg}deg)`,
        opacity: pose.opacity,
      }
    : undefined;
  const tintDx = pose?.dx ?? 0;

  function renderSide(side: 'front' | 'back'): JSX.Element {
    const sideFace = side === 'front' ? frontFace : backFace;
    const showing = (side === 'back') === answerShowing;
    const sideHelpOpen = showing && helpOpen;
    return (
      <div
        className={[
          styles.side,
          side === 'back' ? styles.sideBack : null,
          showing ? null : styles.sideHidden,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={showing ? undefined : true}
        inert={!showing}
      >
        {srs && side === 'back' && (
          <>
            <div
              className={[styles.tintHard, exitTint ? styles.tintExiting : null]
                .filter(Boolean)
                .join(' ')}
              style={{
                opacity:
                  exitTint === 'hard'
                    ? 1
                    : clamp01(-tintDx / SWIPE_TINT_DIVISOR),
              }}
            />
            <div
              className={[styles.tintEasy, exitTint ? styles.tintExiting : null]
                .filter(Boolean)
                .join(' ')}
              style={{
                opacity:
                  exitTint === 'easy'
                    ? 1
                    : clamp01(tintDx / SWIPE_TINT_DIVISOR),
              }}
            />
          </>
        )}
        <div className={styles.utilityRow} onClick={stopPropagation}>
          {showing && (
            <CardAudioButton
              audioUrl={audioUrl}
              label="Play sentence audio"
              ref={audioControlRef}
            />
          )}
          {favourite && (
            /* Handoff: bare Dorado star (no circular fill). `sm` keeps a
             * square 32px hit target near the 34×34 audio tile. Glyph color
             * is forced in `.favourite svg` so it stays Dorado, not steel.
             * Rendered on both plates so it does not pop mid-flip. */
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
            sideHelpOpen
              ? `${styles.content} ${styles.helpOpen}`
              : styles.content
          }
        >
          {sideFace && (
            <div className={styles.face}>
              {sideFace.spanish
                ? quizFaceRuns(sideFace.text).map((run, index) => (
                    <span
                      key={index}
                      className={run.bold ? styles.bold : styles.regular}
                    >
                      {run.text}
                    </span>
                  ))
                : sideFace.text}
            </div>
          )}

          {sideHelpOpen && helpContent && (
            <div className={styles.helpContent} onClick={stopPropagation}>
              {helpContent}
            </div>
          )}
        </div>

        {showing && showHelpButton && (
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

        {/* The hint describes the showing side only; a blank line keeps
         * the hidden plate's layout from shifting mid-flip. */}
        <p className={styles.hint}>{showing ? hintText : '\u00A0'}</p>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={interactionLocked || undefined}
      aria-label={`Flashcard, showing the ${
        answerShowing ? 'answer' : 'prompt'
      }. Press to flip.`}
      className={[
        styles.root,
        srs ? styles.swipeable : null,
        springingBack ? styles.springBack : null,
        exitTransform ? styles.exiting : null,
        helpOpen ? styles.helpOpen : null,
      ]
        .filter(Boolean)
        .join(' ')}
      style={poseStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onTransitionEnd={handleRootTransitionEnd}
      {...dragHandlers}
    >
      <div
        className={[
          styles.flipper,
          answerShowing ? styles.flipped : null,
          flipAnimating ? styles.flipAnimating : null,
        ]
          .filter(Boolean)
          .join(' ')}
        data-quiz-card-flipper=""
        onTransitionEnd={handleFlipperTransitionEnd}
      >
        {renderSide('front')}
        {renderSide('back')}
      </div>
    </div>
  );
}
