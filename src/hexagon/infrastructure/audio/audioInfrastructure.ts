import type {
  AudioElementState,
  AudioPort,
} from '@application/ports/audioPort';
import { AudioContext } from '@composition/context/AudioContext';
import * as Sentry from '@sentry/react';
import { use, useCallback, useEffect, useRef, useState } from 'react';

/**
 * Calls el.play() synchronously (preserving the browser user-gesture token),
 * then catches expected interruption errors so they never become unhandled rejections.
 *
 * AbortError is an expected race (pause/load called before play resolves) — recorded
 * as a breadcrumb only so the fix can be validated in Sentry without generating noise.
 *
 * Any other error is unexpected (e.g. NotSupportedError, NotAllowedError) and is
 * captured as a warning-level Sentry event for investigation, but still not rethrown
 * so it cannot break the UX.
 */
function safePlay(el: HTMLMediaElement): Promise<void> {
  return el.play().catch((error: unknown) => {
    if (error instanceof DOMException && error.name === 'AbortError') {
      Sentry.addBreadcrumb({
        category: 'audio',
        message:
          'play() interrupted (AbortError) — expected race with pause/load',
        level: 'warning',
        data: { src: el.src },
      });
      return;
    }
    Sentry.captureException(error, { level: 'warning' });
  });
}

export function useAudioInfrastructure(): AudioPort {
  const context = use(AudioContext);
  if (!context) throw new Error('AudioContext not found');

  const { playingAudioRef, probeElementRef, runProbeTask } = context;

  const tickRef = useRef<NodeJS.Timeout | null>(null);

  // State for the playing state of the audio
  const [isPlaying, setIsPlaying] = useState(false);
  // State for the current time of the playing audio
  const [currentTime, setCurrentTime] = useState(0);

  // One AbortController tracks the "current audio operation" (play / changeCurrentAudio /
  // pause / cleanup). Every new operation aborts the previous one so that any
  // addEventListener listener registered with its signal is automatically cancelled,
  // preventing stale loadedmetadata / loadeddata callbacks from calling safePlay
  // on a superseded audio element state.
  const operationAbortControllerRef = useRef<AbortController | null>(null);
  if (!operationAbortControllerRef.current) {
    operationAbortControllerRef.current = new AbortController();
  }

  // Abort the current operation and return a fresh signal for the next one.
  // Stable identity (empty deps): only reads/writes the ref, which is always the same object.
  const startNewOperation = useCallback((): AbortSignal => {
    operationAbortControllerRef.current!.abort();
    const next = new AbortController();
    operationAbortControllerRef.current = next;
    return next.signal;
  }, []);

  // Unlocks the audio element for programmatic playback.
  // Must be called synchronously from a user gesture (e.g. "Start Quiz" click).
  const primeAudioElement = useCallback(
    (silenceUrl: string) => {
      if (!playingAudioRef.current) return;
      playingAudioRef.current.src = silenceUrl;
      playingAudioRef.current.play().catch(() => {});
    },
    [playingAudioRef],
  );

  const play = useCallback(async () => {
    // If the audio element is not mounted or is already playing, do nothing
    if (!playingAudioRef.current || isPlaying) {
      return;
    }

    const el = playingAudioRef.current;
    // Abort any previous pending loadedmetadata listener from an earlier play() call
    // that hasn't fired yet (e.g. double-click play before readyState advances).
    const signal = startNewOperation();

    if (el.readyState < 1) {
      // Audio not yet loaded: optimistically mark as playing, then start when metadata arrives.
      setIsPlaying(true);
      el.addEventListener(
        'loadedmetadata',
        () => {
          safePlay(el).then(() => {
            // If a newer operation superseded this one while play() was in flight
            // (e.g. changeCurrentAudio set isPlaying true and is waiting on loadeddata),
            // do not stomp that optimistic state just because el is still paused.
            if (signal.aborted) return;
            // If playback was aborted or failed for a non-AbortError reason,
            // reset the UI so it doesn't show "playing" when nothing is playing.
            if (el.paused) setIsPlaying(false);
          });
        },
        { once: true, signal },
      );
      return;
    }

    setIsPlaying(true);
    await safePlay(el);
    // Same supersession guard as the loadedmetadata path above.
    if (signal.aborted) return;
    // If playback failed for another reason, reset to avoid a stuck "playing" UI.
    if (el.paused) setIsPlaying(false);
  }, [playingAudioRef, isPlaying, startNewOperation]);

  const pause = useCallback(async () => {
    // If the audio is not playing, do nothing
    if (!playingAudioRef.current || !isPlaying) return;
    // Cancel any pending loadedmetadata/loadeddata listener so audio cannot start
    // playing again after this pause (e.g. if readyState was < 1 when play() was called).
    startNewOperation();
    // Pause the audio
    playingAudioRef.current.pause();
    // Stop the UI update propagation
    if (tickRef.current) clearInterval(tickRef.current);
    // UI state update
    setIsPlaying(false);
  }, [playingAudioRef, isPlaying, startNewOperation]);

  // Updates the current time state of the playing audio
  const updateCurrentTime = useCallback(() => {
    if (!playingAudioRef.current) {
      setCurrentTime(0);
      return;
    }
    const currentTimeRef = playingAudioRef.current.currentTime;
    setCurrentTime(currentTimeRef || 0);
  }, [playingAudioRef, setCurrentTime]);

  const changeCurrentAudio = useCallback(
    async (newAudio: AudioElementState) => {
      if (!playingAudioRef.current) return;

      const el = playingAudioRef.current;

      // Cancel any pending loadedmetadata/loadeddata listener from a previous play() or
      // changeCurrentAudio() call, then stop current playback — all on the SAME element
      // to preserve the user-gesture permission chain (never clone/replace the element).
      const signal = startNewOperation();
      el.pause();
      el.onended = null;

      el.src = newAudio.src;
      el.onended = newAudio.onEnded;

      // Use loadeddata (first frame available) to start playback as early as possible
      // when switching sources. The { signal } ensures this listener is cancelled if
      // another changeCurrentAudio() call supersedes this one before loadeddata fires.
      el.addEventListener(
        'loadeddata',
        () => {
          el.currentTime = newAudio.currentTime;
          if (newAudio.playOnLoad) {
            safePlay(el);
          }
        },
        { once: true, signal },
      );

      setIsPlaying(newAudio.playOnLoad);
      el.load();

      updateCurrentTime();
    },
    [playingAudioRef, startNewOperation, updateCurrentTime],
  );

  const cleanupAudio = useCallback(() => {
    // Cancel all pending listeners before touching the element.
    startNewOperation();
    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
      playingAudioRef.current.onended = null;
      playingAudioRef.current.currentTime = 0;
      playingAudioRef.current.src = '';
    }

    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    setIsPlaying(false);
    setCurrentTime(0);
  }, [playingAudioRef, startNewOperation]);

  // Ticks the current time of the playing audio, pushes to state
  useEffect(() => {
    if (isPlaying) {
      tickRef.current = setInterval(updateCurrentTime, 50);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => {
      pause();
    };
  }, [playingAudioRef, isPlaying, updateCurrentTime, pause, play]);

  const getAudioDurationSeconds = useCallback(
    async (audioUrl: string) => {
      const probeElement = probeElementRef.current!;
      return runProbeTask<number>(() => {
        return new Promise<number>((resolve, reject) => {
          let handleLoadedMetadata: () => void;
          let handleError: () => void;
          // Reset before reuse (cancels any prior network activity)
          probeElement.src = '';
          probeElement.load();

          const cleanup = () => {
            probeElement.removeEventListener(
              'loadedmetadata',
              handleLoadedMetadata,
            );
            probeElement.removeEventListener('error', handleError);
          };

          handleLoadedMetadata = () => {
            const durationSeconds = probeElement.duration;
            if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
              cleanup();
              reject(new Error('unknown-duration'));
            } else {
              resolve(durationSeconds);
            }
          };

          handleError = () => {
            cleanup();
            reject(new Error('media-error'));
          };

          // Attach one-shot listeners
          probeElement.addEventListener(
            'loadedmetadata',
            handleLoadedMetadata,
            { once: true },
          );
          probeElement.addEventListener('error', handleError, { once: true });

          try {
            probeElement.src = audioUrl;
            probeElement.load(); // metadata-only fetch
          } catch {
            cleanup();
            reject(new Error('network'));
          }

          return () => {
            cleanup();
          };
        });
      });
    },
    [probeElementRef, runProbeTask],
  );

  return {
    primeAudioElement,
    play,
    pause,
    isPlaying,
    currentTime,
    changeCurrentAudio,
    cleanupAudio,
    getAudioDurationSeconds,
  };
}
