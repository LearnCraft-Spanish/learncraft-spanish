import type { SrsDifficulty } from '@domain/srs';
import { useMediaQuery } from '@interface/hooks/useMediaQuery';
import { useCallback, useEffect, useRef, useState } from 'react';

export const QUIZ_CARD_FLIP_MS = 320;
export const QUIZ_CARD_EXIT_MS = 320;

/** jsdom never fires animationend; finish this long after the CSS duration. */
const FALLBACK_SLACK_MS = 80;

export type QuizCardMotionPhase =
  | 'idle'
  | 'flipping'
  | 'exitingNext'
  | 'enteringPrevious'
  | 'exitingHard'
  | 'exitingEasy';

export interface QuizCardMotion {
  phase: QuizCardMotionPhase;
  /** true whenever phase !== 'idle' */
  isAnimating: boolean;
  /** Mirrors `(prefers-reduced-motion: reduce)`. */
  reducedMotion: boolean;
  /** Commit runs IMMEDIATELY (the flip is a CSS transition driven by the new answer state); phase becomes 'flipping' until completePhase/fallback. */
  flip: (commit: () => void) => void;
  /** Phase 'exitingNext'; commit runs when the phase completes. */
  next: (commit: () => void) => void;
  /** Phase 'enteringPrevious'; commit runs when the phase completes. */
  previous: (commit: () => void) => void;
  /** Phase 'exitingHard' | 'exitingEasy'; commit runs when the phase completes. */
  grade: (difficulty: SrsDifficulty, commit: () => void) => void;
  /** Call from the animating element's onAnimationEnd / onTransitionEnd. Runs the pending commit (if any) exactly once and returns to 'idle'. No-op when idle. */
  completePhase: () => void;
}

/**
 * Visual-only text-quiz card phases (flip, advance, and hard/easy exit).
 * The caller owns every commit. Lives in the interface layer per
 * `interface/DECISIONS.md`.
 */
export function useQuizCardMotion(): QuizCardMotion {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [phase, setPhase] = useState<QuizCardMotionPhase>('idle');

  const phaseRef = useRef<QuizCardMotionPhase>('idle');
  const reducedMotionRef = useRef(reducedMotion);
  const pendingCommitRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const completePhase = useCallback((): void => {
    if (!mountedRef.current || phaseRef.current === 'idle') {
      return;
    }
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const commit = pendingCommitRef.current;
    pendingCommitRef.current = null;
    phaseRef.current = 'idle';
    setPhase('idle');
    commit?.();
  }, []);

  const startPhase = useCallback(
    (
      nextPhase: QuizCardMotionPhase,
      commit: () => void,
      durationMs: number,
      commitTiming: 'immediate' | 'onComplete',
    ): void => {
      if (phaseRef.current !== 'idle') {
        return;
      }
      if (reducedMotionRef.current) {
        commit();
        return;
      }

      phaseRef.current = nextPhase;
      pendingCommitRef.current = commitTiming === 'onComplete' ? commit : null;
      setPhase(nextPhase);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        completePhase();
      }, durationMs + FALLBACK_SLACK_MS);
      if (commitTiming === 'immediate') {
        commit();
      }
    },
    [completePhase],
  );

  const flip = useCallback(
    (commit: () => void): void => {
      startPhase('flipping', commit, QUIZ_CARD_FLIP_MS, 'immediate');
    },
    [startPhase],
  );

  const next = useCallback(
    (commit: () => void): void => {
      startPhase('exitingNext', commit, QUIZ_CARD_EXIT_MS, 'onComplete');
    },
    [startPhase],
  );

  const previous = useCallback(
    (commit: () => void): void => {
      startPhase('enteringPrevious', commit, QUIZ_CARD_EXIT_MS, 'onComplete');
    },
    [startPhase],
  );

  const grade = useCallback(
    (difficulty: SrsDifficulty, commit: () => void): void => {
      // 'viewed' has no exit phase; still deliver the caller's commit.
      if (difficulty === 'viewed') {
        if (phaseRef.current !== 'idle') {
          return;
        }
        commit();
        return;
      }
      startPhase(
        difficulty === 'hard' ? 'exitingHard' : 'exitingEasy',
        commit,
        QUIZ_CARD_EXIT_MS,
        'onComplete',
      );
    },
    [startPhase],
  );

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // Drop the commit unrun so a late timer cannot setState after unmount.
      pendingCommitRef.current = null;
    };
  }, []);

  return {
    phase,
    isAnimating: phase !== 'idle',
    reducedMotion,
    flip,
    next,
    previous,
    grade,
    completePhase,
  };
}
