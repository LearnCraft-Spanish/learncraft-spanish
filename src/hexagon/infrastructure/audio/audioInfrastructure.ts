import type {
  AudioElementState,
  AudioPort,
} from '@application/ports/audioPort';
import { AudioContext } from '@composition/context/AudioContext';
import { use, useCallback, useEffect, useRef, useState } from 'react';

export function useAudioInfrastructure(): AudioPort {
  const context = use(AudioContext);
  if (!context) throw new Error('AudioContext not found');

  const { playingAudioRef, probeElementRef, runProbeTask } = context;

  const tickRef = useRef<NodeJS.Timeout | null>(null);

  // State for the playing state of the audio
  const [isPlaying, setIsPlaying] = useState(false);
  // State for the current time of the playing audio
  const [currentTime, setCurrentTime] = useState(0);

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
    } else if (playingAudioRef.current.readyState < 1) {
      // If the audio is not ready to be played, play it when the metadata is loaded
      setIsPlaying(true);
      playingAudioRef.current.addEventListener(
        'loadedmetadata',
        () => {
          playingAudioRef.current?.play();
        },
        { once: true },
      );
      return;
    }
    setIsPlaying(true);
    await playingAudioRef.current.play();
  }, [playingAudioRef, isPlaying, setIsPlaying]);

  const pause = useCallback(async () => {
    // If the audio is not playing, do nothing
    if (!playingAudioRef.current || !isPlaying) return;
    // Pause the audio
    await playingAudioRef.current.pause();
    // Stop the UI update propagation
    if (tickRef.current) clearInterval(tickRef.current);
    // UI state update
    setIsPlaying(false);
  }, [playingAudioRef, isPlaying, setIsPlaying]);

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

      // Stop current playback and clear pending listeners on the SAME element
      // (preserves the user-gesture permission chain — never clone/replace)
      el.pause();
      el.onloadedmetadata = null;
      el.onended = null;

      el.src = newAudio.src;
      el.onended = newAudio.onEnded;

      // Use canplay so playback starts as soon as enough is buffered (reduces gap when switching to buffer)
      el.addEventListener(
        'canplay',
        () => {
          el.currentTime = newAudio.currentTime;
          if (newAudio.playOnLoad) {
            el.play();
          }
        },
        { once: true },
      );

      setIsPlaying(newAudio.playOnLoad);
      el.load();

      updateCurrentTime();
    },
    [playingAudioRef, updateCurrentTime],
  );

  const cleanupAudio = useCallback(() => {
    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
      playingAudioRef.current.onloadedmetadata = null;
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
  }, [playingAudioRef]);

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
