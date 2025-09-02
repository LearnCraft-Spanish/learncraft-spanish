import type {
  AudioElementState,
  AudioPort,
} from '@application/ports/audioPort';
import { AudioContext } from '@composition/context/AudioContext';
import { use, useCallback, useEffect, useRef, useState } from 'react';

export function useAudioInfrastructure(): AudioPort {
  const context = use(AudioContext);
  if (!context) throw new Error('AudioContext not found');

  const tickRef = useRef<NodeJS.Timeout | null>(null);

  // State for the playing state of the audio
  const [isPlaying, setIsPlaying] = useState(false);
  // State for the current time of the playing audio
  const [currentTime, setCurrentTime] = useState(0);

  const play = useCallback(async () => {
    // If the audio is already playing, do nothing
    if (!context.playingAudioRef.current || isPlaying) return;
    await context.playingAudioRef.current.play();
    setIsPlaying(true);
  }, [context, isPlaying, setIsPlaying]);

  const pause = useCallback(async () => {
    // If the audio is not playing, do nothing
    if (!context.playingAudioRef.current || !isPlaying) return;
    // Pause the audio
    await context.playingAudioRef.current.pause();
    // Stop the UI update propagation
    if (tickRef.current) clearInterval(tickRef.current);
    // UI state update
    setIsPlaying(false);
  }, [context, isPlaying, setIsPlaying]);

  const updateCurrentTime = useCallback(() => {
    if (!isPlaying || !context.playingAudioRef.current) return;
    const currentTimeRef = context.playingAudioRef.current?.currentTime ?? 0;
    setCurrentTime(currentTimeRef);
  }, [context.playingAudioRef, isPlaying, setCurrentTime]);

  // Helper function to get audio duration
  const getAudioDuration = (
    audioElement: HTMLAudioElement | null,
  ): Promise<number | null> => {
    if (!audioElement) return Promise.resolve(null);

    return new Promise((resolve) => {
      if (audioElement.readyState >= 1) {
        // Metadata already loaded
        resolve(audioElement.duration);
      } else {
        // Wait for metadata to load
        const handleLoadedMetadata = () => {
          // Clean up the event listener
          audioElement.removeEventListener(
            'loadedmetadata',
            handleLoadedMetadata,
          );
          // Resolve the promise with the duration
          resolve(audioElement.duration);
        };
        audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      }
    });
  };

  const changeCurrentAudio = useCallback(
    async (current: AudioElementState) => {
      if (!context.playingAudioRef.current) return;
      context.playingAudioRef.current.src = current.src;
      context.playingAudioRef.current.currentTime = current.currentTime;
      updateCurrentTime();
      context.playingAudioRef.current.onended = current.onEnded;
      current.playing ? play() : pause();
    },
    [context, play, pause, updateCurrentTime],
  );

  const updateCurrentAudioQueue = useCallback(
    async (newQueue: { english: string; spanish: string }) => {
      // If the context Audio Elements are not set, return null values
      if (
        !context.currentEnglishAudioRef.current ||
        !context.currentSpanishAudioRef.current
      ) {
        return {
          englishDuration: null,
          spanishDuration: null,
        };
      }
      // Update the source of the audio elements
      context.currentEnglishAudioRef.current.src = newQueue.english;
      context.currentSpanishAudioRef.current.src = newQueue.spanish;

      // Get the duration of the audio elements
      const [englishDuration, spanishDuration] = await Promise.all([
        getAudioDuration(context.currentEnglishAudioRef.current),
        getAudioDuration(context.currentSpanishAudioRef.current),
      ]);

      // Return the duration of the audio elements
      return {
        englishDuration,
        spanishDuration,
      };
    },
    [context],
  );

  const updateNextAudioQueue = useCallback(
    async (newQueue: { english: string; spanish: string }) => {
      // If the context Audio Elements are not set, return null values
      if (
        !context.nextEnglishAudioRef.current ||
        !context.nextSpanishAudioRef.current
      ) {
        return {
          englishDuration: null,
          spanishDuration: null,
        };
      }
      // Update the source of the audio elements
      context.nextEnglishAudioRef.current.src = newQueue.english;
      context.nextSpanishAudioRef.current.src = newQueue.spanish;

      // Get the duration of the audio elements
      const [englishDuration, spanishDuration] = await Promise.all([
        getAudioDuration(context.nextEnglishAudioRef.current),
        getAudioDuration(context.nextSpanishAudioRef.current),
      ]);

      // Return the duration of the audio elements
      return {
        englishDuration,
        spanishDuration,
      };
    },
    [context],
  );

  useEffect(() => {
    if (!isPlaying || !context.playingAudioRef.current) return;
    tickRef.current = setInterval(updateCurrentTime, 50);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [context.playingAudioRef, isPlaying, updateCurrentTime]);

  return {
    play,
    pause,
    isPlaying,
    currentTime,
    changeCurrentAudio,
    updateCurrentAudioQueue,
    updateNextAudioQueue,
  };
}
