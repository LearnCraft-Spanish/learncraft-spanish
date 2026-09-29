import {
  QUIZ_CARD_EXIT_MS,
  QUIZ_CARD_FLIP_MS,
  useQuizCardMotion,
} from '@interface/hooks/useQuizCardMotion';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Matches the hook's unexported fallback slack (CSS duration + 80ms). */
const FALLBACK_SLACK_MS = 80;

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

/** Minimal `MediaQueryList` stub — jsdom does not implement `matchMedia`. */
function stubMatchMedia(matches: boolean): void {
  const list: MockMediaQueryList = {
    matches,
    media: '',
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  vi.stubGlobal('matchMedia', (query: string) => {
    list.media = query;
    return list;
  });
}

describe('useQuizCardMotion', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('starts idle when matchMedia is missing (jsdom default)', () => {
    const { result } = renderHook(() => useQuizCardMotion());

    expect(result.current.phase).toBe('idle');
    expect(result.current.isAnimating).toBe(false);
    expect(result.current.reducedMotion).toBe(false);
  });

  it('runs every action immediately and stays idle when reduced motion is preferred', () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useQuizCardMotion());
    expect(result.current.reducedMotion).toBe(true);

    const actions: Array<(commit: () => void) => void> = [
      (commit) => result.current.flip(commit),
      (commit) => result.current.next(commit),
      (commit) => result.current.previous(commit),
      (commit) => result.current.grade('hard', commit),
      (commit) => result.current.grade('easy', commit),
    ];

    for (const run of actions) {
      const commit = vi.fn<() => void>();
      act(() => {
        run(commit);
      });
      expect(commit).toHaveBeenCalledOnce();
      expect(result.current.phase).toBe('idle');
      expect(result.current.isAnimating).toBe(false);

      act(() => {
        vi.advanceTimersByTime(QUIZ_CARD_EXIT_MS + FALLBACK_SLACK_MS);
      });
      expect(commit).toHaveBeenCalledOnce();
      expect(result.current.phase).toBe('idle');
    }
  });

  it('commits a flip immediately, then returns to idle on completePhase', () => {
    const commit = vi.fn<() => void>();
    const { result } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.flip(commit);
    });

    expect(commit).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe('flipping');
    expect(result.current.isAnimating).toBe(true);

    act(() => {
      result.current.completePhase();
    });

    expect(commit).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe('idle');
    expect(result.current.isAnimating).toBe(false);
  });

  it('defers next until the phase completes', () => {
    const commit = vi.fn<() => void>();
    const { result } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.next(commit);
    });

    expect(commit).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('exitingNext');
    expect(result.current.isAnimating).toBe(true);

    act(() => {
      result.current.completePhase();
    });

    expect(commit).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe('idle');
  });

  it('defers previous until the phase completes', () => {
    const commit = vi.fn<() => void>();
    const { result } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.previous(commit);
    });

    expect(commit).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('enteringPrevious');

    act(() => {
      result.current.completePhase();
    });

    expect(commit).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe('idle');
  });

  it('defers a hard grade until the phase completes', () => {
    const commit = vi.fn<() => void>();
    const { result } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.grade('hard', commit);
    });

    expect(commit).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('exitingHard');

    act(() => {
      result.current.completePhase();
    });

    expect(commit).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe('idle');
  });

  it('defers an easy grade until the phase completes', () => {
    const commit = vi.fn<() => void>();
    const { result } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.grade('easy', commit);
    });

    expect(commit).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('exitingEasy');

    act(() => {
      result.current.completePhase();
    });

    expect(commit).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe('idle');
  });

  it('commits a viewed grade immediately because it has no exit phase', () => {
    const commit = vi.fn<() => void>();
    const { result } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.grade('viewed', commit);
    });

    expect(commit).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe('idle');
  });

  it('ignores actions while a phase is running', () => {
    const first = vi.fn<() => void>();
    const ignored = vi.fn<() => void>();
    const { result } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.next(first);
    });

    act(() => {
      result.current.flip(ignored);
      result.current.next(ignored);
      result.current.previous(ignored);
      result.current.grade('hard', ignored);
      result.current.grade('easy', ignored);
      result.current.grade('viewed', ignored);
    });

    expect(ignored).not.toHaveBeenCalled();
    expect(first).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('exitingNext');

    act(() => {
      result.current.completePhase();
    });

    expect(first).toHaveBeenCalledOnce();
    expect(ignored).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('idle');
  });

  it('runs a pending commit only once from completePhase', () => {
    const commit = vi.fn<() => void>();
    const { result } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.completePhase();
    });
    expect(result.current.phase).toBe('idle');

    act(() => {
      result.current.previous(commit);
    });
    act(() => {
      result.current.completePhase();
      result.current.completePhase();
    });
    act(() => {
      vi.advanceTimersByTime(QUIZ_CARD_EXIT_MS + FALLBACK_SLACK_MS);
    });

    expect(commit).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe('idle');
  });

  it('finishes a flip from the fallback timer', () => {
    const commit = vi.fn<() => void>();
    const { result } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.flip(commit);
    });
    expect(commit).toHaveBeenCalledOnce();

    act(() => {
      vi.advanceTimersByTime(QUIZ_CARD_FLIP_MS + FALLBACK_SLACK_MS - 1);
    });
    expect(result.current.phase).toBe('flipping');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.phase).toBe('idle');
    expect(commit).toHaveBeenCalledOnce();
  });

  it('runs an exit commit from the fallback timer', () => {
    const commit = vi.fn<() => void>();
    const { result } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.next(commit);
    });

    act(() => {
      vi.advanceTimersByTime(QUIZ_CARD_EXIT_MS + FALLBACK_SLACK_MS - 1);
    });
    expect(commit).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('exitingNext');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(commit).toHaveBeenCalledOnce();
    expect(result.current.phase).toBe('idle');
    expect(result.current.isAnimating).toBe(false);
  });

  it('does not run a pending commit after unmount', () => {
    const commit = vi.fn<() => void>();
    const { result, unmount } = renderHook(() => useQuizCardMotion());

    act(() => {
      result.current.grade('easy', commit);
    });
    expect(commit).not.toHaveBeenCalled();
    expect(result.current.phase).toBe('exitingEasy');

    unmount();
    act(() => {
      vi.advanceTimersByTime(QUIZ_CARD_EXIT_MS + FALLBACK_SLACK_MS);
    });

    expect(commit).not.toHaveBeenCalled();
  });

  it('keeps action identities stable across rerenders', () => {
    const { result, rerender } = renderHook(() => useQuizCardMotion());
    const first = result.current;

    rerender();

    expect(result.current.flip).toBe(first.flip);
    expect(result.current.next).toBe(first.next);
    expect(result.current.previous).toBe(first.previous);
    expect(result.current.grade).toBe(first.grade);
    expect(result.current.completePhase).toBe(first.completePhase);

    act(() => {
      result.current.next(vi.fn<() => void>());
    });
    rerender();

    expect(result.current.flip).toBe(first.flip);
    expect(result.current.next).toBe(first.next);
    expect(result.current.previous).toBe(first.previous);
    expect(result.current.grade).toBe(first.grade);
    expect(result.current.completePhase).toBe(first.completePhase);
  });
});
