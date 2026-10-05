import type { QuizCardMotionPhase } from '@interface/hooks/useQuizCardMotion';
import type { AnimationEvent, JSX, ReactNode, TransitionEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './QuizCardStage.module.scss';

function exitClass(phase: QuizCardMotionPhase): string | null {
  switch (phase) {
    case 'exitingNext':
      return styles.exitNext;
    case 'exitingHard':
      return styles.exitHard;
    case 'exitingEasy':
      return styles.exitEasy;
    default:
      return null;
  }
}

function isExitPhase(phase: QuizCardMotionPhase): boolean {
  return (
    phase === 'exitingNext' ||
    phase === 'exitingHard' ||
    phase === 'exitingEasy'
  );
}

/** Set by `QuizCard` on its rotating element; the stage only hears it bubble. */
const FLIPPER_ATTRIBUTE = 'data-quiz-card-flipper';

export interface QuizCardStageProps {
  /** From `useQuizCardMotion`; picks the layer animation. */
  phase: QuizCardMotionPhase;
  /** The empty plate behind the card. False on the last card. */
  showPeek: boolean;
  /** The live `QuizCard`. */
  children: ReactNode;
  /** Snapshot of the previous card; rendered only while entering. */
  incoming?: ReactNode;
  /**
   * The next card, in the peek pose, while the live card is leaving.
   * Replaces the empty plate for that phase.
   */
  underneath?: ReactNode;
  /** Fires once per phase when its animation or flip transition ends. */
  onMotionComplete: () => void;
}

/**
 * Stacks the live card over the next card — an empty plate until a leave
 * animation, then that card's question — and runs the layer-level motions:
 * next / hard / easy fly-outs on the card layer, the previous card pulled
 * out from under the deck and placed on top, and a short settle when a new
 * card takes the top of the deck. The previous card's stacking and its
 * motion are separate elements, so a transform cannot paint it over the
 * live card before it has swung out. The flip itself lives in `QuizCard`;
 * this stage just reports when it ends.
 */
export function QuizCardStage({
  phase,
  showPeek,
  children,
  incoming,
  underneath,
  onMotionComplete,
}: QuizCardStageProps): JSX.Element {
  const [prevPhase, setPrevPhase] = useState(phase);
  const [settling, setSettling] = useState(false);
  const completedPhaseRef = useRef<QuizCardMotionPhase | null>(null);

  // A new card only arrives when an exit completes; it rises from the peek
  // pose. Adjusted during render so the first frame is already in pose.
  if (prevPhase !== phase) {
    setPrevPhase(phase);
    setSettling(phase === 'idle' && isExitPhase(prevPhase));
  }

  useEffect(() => {
    if (phase === 'idle') {
      completedPhaseRef.current = null;
    }
  }, [phase]);

  function complete(): void {
    if (phase === 'idle' || completedPhaseRef.current === phase) {
      return;
    }
    completedPhaseRef.current = phase;
    onMotionComplete();
  }

  function handleCardAnimationEnd(event: AnimationEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (isExitPhase(phase)) {
      complete();
      return;
    }
    setSettling(false);
  }

  function handleCardTransitionEnd(
    event: TransitionEvent<HTMLDivElement>,
  ): void {
    if (
      phase === 'flipping' &&
      event.propertyName === 'transform' &&
      event.target instanceof Element &&
      event.target.hasAttribute(FLIPPER_ATTRIBUTE)
    ) {
      complete();
    }
  }

  function handleIncomingAnimationEnd(
    event: AnimationEvent<HTMLDivElement>,
  ): void {
    if (event.target === event.currentTarget && phase === 'enteringPrevious') {
      complete();
    }
  }

  return (
    <div className={styles.cardStage}>
      {underneath ? (
        <div className={styles.underneath} aria-hidden>
          {underneath}
        </div>
      ) : (
        showPeek && <div className={styles.deckPeek} aria-hidden />
      )}

      <div
        className={[
          styles.cardLayer,
          exitClass(phase),
          settling ? styles.settle : null,
        ]
          .filter(Boolean)
          .join(' ')}
        onAnimationEnd={handleCardAnimationEnd}
        onTransitionEnd={handleCardTransitionEnd}
      >
        {children}
      </div>

      {phase === 'enteringPrevious' && incoming && (
        <div
          className={`${styles.incomingLayer} ${styles.enterPrev}`}
          onAnimationEnd={handleIncomingAnimationEnd}
        >
          <div className={styles.incomingMotion}>{incoming}</div>
        </div>
      )}
    </div>
  );
}
