import type { AudioEngine } from '@composition/context/AudioContext';
import { AudioContext } from '@composition/context/AudioContext';
import { useAudioInfrastructure } from '@infrastructure/audio/audioInfrastructure';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Build a minimal AudioEngine backed by a real jsdom HTMLAudioElement. */
function makeAudioEngine() {
  const audio = document.createElement('audio') as HTMLAudioElement;

  // Plain mutable ref objects — React.RefObject<T> is just { readonly current: T },
  // so a plain object satisfies the shape without needing useRef (a React Hook).
  const playingAudioRef: React.RefObject<HTMLAudioElement | null> = {
    current: audio,
  };

  const probeAudio = document.createElement('audio') as HTMLAudioElement;
  const probeElementRef: React.RefObject<HTMLAudioElement | null> = {
    current: probeAudio,
  };

  let probeChain: Promise<unknown> = Promise.resolve();
  const runProbeTask = <T,>(task: () => Promise<T>): Promise<T> => {
    const next = probeChain.then(task, task);
    probeChain = next;
    return next as Promise<T>;
  };

  const engine: AudioEngine = {
    playingAudioRef,
    probeElementRef,
    runProbeTask,
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AudioContext value={engine}>{children}</AudioContext>
  );

  return { audio, wrapper };
}

/** Set audio.readyState to a specific value (jsdom readyState is read-only). */
function setReadyState(audio: HTMLAudioElement, value: number) {
  Object.defineProperty(audio, 'readyState', { configurable: true, value });
}

/** Build a DOMException that matches a browser AbortError from interrupted play(). */
function makeAbortError() {
  return new DOMException(
    'The play() request was interrupted by a call to pause().',
    'AbortError',
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAudioInfrastructure — play/pause race safety', () => {
  /**
   * Vitest automatically treats unhandled promise rejections as test failures,
   * so each test below implicitly asserts "no unhandled rejection" by completing
   * without error. Explicit isPlaying state assertions confirm the UI stays
   * consistent with the actual playback state.
   */

  describe('safePlay — AbortError is swallowed, not rethrown', () => {
    it('play() with a browser AbortError does not surface as an unhandled rejection', async () => {
      const { audio, wrapper } = makeAudioEngine();
      setReadyState(audio, 4); // HAVE_ENOUGH_DATA — takes the synchronous play() path
      vi.spyOn(audio, 'play').mockRejectedValueOnce(makeAbortError());

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      // If safePlay did not catch AbortError, this await would propagate the
      // rejection and vitest would fail the test automatically.
      await act(async () => {
        await result.current.play();
      });
    });

    it('resets isPlaying to false when play() is interrupted (el.paused stays true)', async () => {
      const { audio, wrapper } = makeAudioEngine();
      setReadyState(audio, 4);
      vi.spyOn(audio, 'play').mockRejectedValueOnce(makeAbortError());

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      await act(async () => {
        await result.current.play();
      });

      // isPlaying was optimistically set true, but after the AbortError the
      // paused-element check resets it to false.
      expect(result.current.isPlaying).toBe(false);
    });

    it('keeps isPlaying true when play() resolves and audio is actually playing', async () => {
      const { audio, wrapper } = makeAudioEngine();
      setReadyState(audio, 4);
      vi.spyOn(audio, 'play').mockResolvedValueOnce(undefined);
      // jsdom does not actually play audio, so simulate el.paused === false
      Object.defineProperty(audio, 'paused', {
        configurable: true,
        get: () => false,
      });

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      await act(async () => {
        await result.current.play();
      });

      expect(result.current.isPlaying).toBe(true);
    });

    it('primeAudioElement routes through safePlay (no unhandled rejection on AbortError)', async () => {
      const { audio, wrapper } = makeAudioEngine();
      const playSpy = vi
        .spyOn(audio, 'play')
        .mockRejectedValueOnce(makeAbortError());

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      await act(async () => {
        result.current.primeAudioElement('https://example.com/silence.mp3');
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(audio.src).toContain('silence.mp3');
      expect(playSpy).toHaveBeenCalledTimes(1);
      // Priming must not flip quiz UI playing state
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('abortController — stale listener cancellation', () => {
    it('cancels a pending loadedmetadata listener when changeCurrentAudio is called', async () => {
      const { audio, wrapper } = makeAudioEngine();
      // readyState 0 → play() queues a loadedmetadata listener instead of calling el.play() directly
      setReadyState(audio, 0);
      const playSpy = vi.spyOn(audio, 'play').mockResolvedValue(undefined);

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      await act(async () => {
        await result.current.play();
      });
      // The loadedmetadata listener is registered but hasn't fired yet
      expect(playSpy).not.toHaveBeenCalled();

      // changeCurrentAudio() calls startNewOperation() which aborts the pending listener
      await act(async () => {
        await result.current.changeCurrentAudio({
          currentTime: 0,
          src: 'https://example.com/new.mp3',
          onEnded: vi.fn(),
          playOnLoad: false,
        });
      });

      // Simulate the browser firing 'loadedmetadata' for the old source —
      // the stale listener should be silently cancelled (signal was aborted)
      await act(async () => {
        audio.dispatchEvent(new Event('loadedmetadata'));
      });

      expect(playSpy).not.toHaveBeenCalled();
    });

    it('only the second loadeddata listener fires when changeCurrentAudio is called twice rapidly', async () => {
      const { audio, wrapper } = makeAudioEngine();
      setReadyState(audio, 4);
      const playSpy = vi.spyOn(audio, 'play').mockResolvedValue(undefined);

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      // Call changeCurrentAudio twice in the same act — the first call's loadeddata
      // listener should be cancelled by the second call's startNewOperation().
      await act(async () => {
        await result.current.changeCurrentAudio({
          currentTime: 0,
          src: 'https://example.com/first.mp3',
          onEnded: vi.fn(),
          playOnLoad: true,
        });
        await result.current.changeCurrentAudio({
          currentTime: 0,
          src: 'https://example.com/second.mp3',
          onEnded: vi.fn(),
          playOnLoad: true,
        });
      });

      // Dispatch loadeddata once — only the second call's listener is still active
      await act(async () => {
        audio.dispatchEvent(new Event('loadeddata'));
      });

      // Exactly one play() call from the surviving (second) listener
      expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it('cancels a pending loadedmetadata listener when pause() is called before metadata loads', async () => {
      const { audio, wrapper } = makeAudioEngine();
      setReadyState(audio, 0);
      const playSpy = vi.spyOn(audio, 'play').mockResolvedValue(undefined);
      vi.spyOn(audio, 'pause').mockImplementation(() => {});

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      await act(async () => {
        await result.current.play();
      });
      // Listener registered, isPlaying optimistically true
      expect(result.current.isPlaying).toBe(true);

      await act(async () => {
        await result.current.pause();
      });

      // Firing loadedmetadata now must NOT trigger play() since the listener was cancelled
      await act(async () => {
        audio.dispatchEvent(new Event('loadedmetadata'));
      });

      expect(playSpy).not.toHaveBeenCalled();
      expect(result.current.isPlaying).toBe(false);
    });

    it('resets isPlaying when changeCurrentAudio playOnLoad fails and element stays paused', async () => {
      const { audio, wrapper } = makeAudioEngine();
      setReadyState(audio, 4);
      vi.spyOn(audio, 'play').mockRejectedValueOnce(makeAbortError());
      vi.spyOn(audio, 'pause').mockImplementation(() => {});

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      await act(async () => {
        await result.current.changeCurrentAudio({
          currentTime: 0,
          src: 'https://example.com/next.mp3',
          onEnded: vi.fn(),
          playOnLoad: true,
        });
      });
      expect(result.current.isPlaying).toBe(true);

      await act(async () => {
        audio.dispatchEvent(new Event('loadeddata'));
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it('keeps isPlaying true when a newer changeCurrentAudio supersedes a failed playOnLoad', async () => {
      const { audio, wrapper } = makeAudioEngine();
      setReadyState(audio, 4);

      let resolveFirstPlay!: () => void;
      vi.spyOn(audio, 'play').mockImplementationOnce(
        () =>
          new Promise<undefined>((res) => {
            resolveFirstPlay = res as () => void;
          }),
      );
      vi.spyOn(audio, 'pause').mockImplementation(() => {});

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      await act(async () => {
        await result.current.changeCurrentAudio({
          currentTime: 0,
          src: 'https://example.com/first.mp3',
          onEnded: vi.fn(),
          playOnLoad: true,
        });
      });

      await act(async () => {
        audio.dispatchEvent(new Event('loadeddata'));
      });

      await act(async () => {
        await result.current.changeCurrentAudio({
          currentTime: 0,
          src: 'https://example.com/second.mp3',
          onEnded: vi.fn(),
          playOnLoad: true,
        });
      });
      expect(result.current.isPlaying).toBe(true);

      await act(async () => {
        resolveFirstPlay();
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(result.current.isPlaying).toBe(true);
    });
  });

  describe('rapid play/pause — isPlaying state consistency', () => {
    it('ends with isPlaying false when play() is immediately followed by pause()', async () => {
      const { audio, wrapper } = makeAudioEngine();
      setReadyState(audio, 4);

      let resolvePlay!: () => void;
      // play() returns a long-running promise so we can call pause() before it resolves
      vi.spyOn(audio, 'play').mockImplementation(
        () =>
          new Promise<undefined>((res) => {
            resolvePlay = res as () => void;
          }),
      );
      vi.spyOn(audio, 'pause').mockImplementation(() => {});

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      // Start play — promise is pending
      act(() => {
        result.current.play().catch(() => {});
      });

      // Immediately pause — aborts the pending operation
      await act(async () => {
        await result.current.pause();
      });

      // Resolve play (simulating AbortError would happen in real browser; here we
      // just resolve to exercise the el.paused check path)
      await act(async () => {
        resolvePlay();
        await new Promise((r) => setTimeout(r, 0));
      });

      // Final state must be paused regardless of the play() resolution order
      expect(result.current.isPlaying).toBe(false);
    });

    it('does not stomp isPlaying when changeCurrentAudio supersedes an in-flight play()', async () => {
      const { audio, wrapper } = makeAudioEngine();
      setReadyState(audio, 4);

      let resolvePlay!: () => void;
      vi.spyOn(audio, 'play').mockImplementation(
        () =>
          new Promise<undefined>((res) => {
            resolvePlay = res as () => void;
          }),
      );
      vi.spyOn(audio, 'pause').mockImplementation(() => {});

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      // Start play — safePlay promise is pending after optimistic setIsPlaying(true)
      act(() => {
        result.current.play().catch(() => {});
      });
      expect(result.current.isPlaying).toBe(true);

      // Superseding operation wants playback (playOnLoad) but new audio has not
      // started yet, so el.paused remains true — the stale play() continuation
      // must not reset isPlaying to false.
      await act(async () => {
        await result.current.changeCurrentAudio({
          currentTime: 0,
          src: 'https://example.com/next.mp3',
          onEnded: vi.fn(),
          playOnLoad: true,
        });
      });
      expect(result.current.isPlaying).toBe(true);

      await act(async () => {
        resolvePlay();
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(result.current.isPlaying).toBe(true);
    });

    it('does not stomp isPlaying when changeCurrentAudio supersedes after loadedmetadata', async () => {
      const { audio, wrapper } = makeAudioEngine();
      setReadyState(audio, 0);

      let resolvePlay!: () => void;
      vi.spyOn(audio, 'play').mockImplementation(
        () =>
          new Promise<undefined>((res) => {
            resolvePlay = res as () => void;
          }),
      );
      vi.spyOn(audio, 'pause').mockImplementation(() => {});

      const { result } = renderHook(() => useAudioInfrastructure(), {
        wrapper,
      });

      await act(async () => {
        await result.current.play();
      });

      // Fire loadedmetadata so safePlay starts; leave the promise pending.
      await act(async () => {
        audio.dispatchEvent(new Event('loadedmetadata'));
      });

      await act(async () => {
        await result.current.changeCurrentAudio({
          currentTime: 0,
          src: 'https://example.com/next.mp3',
          onEnded: vi.fn(),
          playOnLoad: true,
        });
      });
      expect(result.current.isPlaying).toBe(true);

      await act(async () => {
        resolvePlay();
        await new Promise((r) => setTimeout(r, 0));
      });

      expect(result.current.isPlaying).toBe(true);
    });
  });
});
