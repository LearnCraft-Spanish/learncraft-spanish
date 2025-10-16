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

  const play = useCallback(async () => {
    console.log('play');
    console.log('playingAudioRef.current', playingAudioRef.current?.src);
    // If the audio element is not mounted or is already playing, do nothing
    if (!playingAudioRef.current || isPlaying) {
      console.log('not playing');
      return;
    } else if (playingAudioRef.current.readyState < 1) {
      console.log('not ready');
      // If the audio is not ready to be played, play it when the metadata is loaded
      setIsPlaying(true);

      const handlePlayOnLoad = () => {
        console.log('handlePlayOnLoad');
        if (playingAudioRef.current) {
          console.log('playing');
          playingAudioRef.current.play();
        }
        // Remove this listener after it fires once
        playingAudioRef.current?.removeEventListener(
          'loadedmetadata',
          handlePlayOnLoad,
        );
      };
      playingAudioRef.current.addEventListener(
        'loadedmetadata',
        handlePlayOnLoad,
      );
      return;
    }
    // If the audio is ready to be played, play it
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

      // Remove any existing loadedmetadata listeners to prevent double play
      const audioElement = playingAudioRef.current;
      const existingListeners = audioElement.cloneNode(
        true,
      ) as HTMLAudioElement;
      audioElement.replaceWith(existingListeners);
      playingAudioRef.current = existingListeners;

      // Set up new audio properties
      playingAudioRef.current.src = newAudio.src;
      playingAudioRef.current.currentTime = newAudio.currentTime;
      playingAudioRef.current.onended = newAudio.onEnded;

      // Add single loadedmetadata listener if playOnLoad is true
      if (newAudio.playOnLoad) {
        setIsPlaying(true);

        const handleLoadedMetadata = () => {
          if (playingAudioRef.current) {
            playingAudioRef.current.play();
          }
          // Remove this listener after it fires once
          playingAudioRef.current?.removeEventListener(
            'loadedmetadata',
            handleLoadedMetadata,
          );
        };
        playingAudioRef.current.addEventListener(
          'loadedmetadata',
          handleLoadedMetadata,
        );
      }

      updateCurrentTime();
    },
    [playingAudioRef, updateCurrentTime],
  );

  // Clean up audio state completely
  const cleanupAudio = useCallback(() => {
    // Stop any playing audio
    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
      playingAudioRef.current.currentTime = 0;
      playingAudioRef.current.src = '';
    }

    // Clear any intervals
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    // Reset state
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
    play,
    pause,
    isPlaying,
    currentTime,
    changeCurrentAudio,
    cleanupAudio,
    getAudioDurationSeconds,
  };
}
