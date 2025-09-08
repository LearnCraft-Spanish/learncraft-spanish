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
    // If the audio element is not mounted or is already playing, do nothing
    if (!context.playingAudioRef.current || isPlaying) {
      return;
    } else if (context.playingAudioRef.current.readyState < 1) {
      // If the audio is not ready to be played, play it when the metadata is loaded
      setIsPlaying(true);
      await context.playingAudioRef.current.addEventListener(
        'loadedmetadata',
        () => {
          if (context.playingAudioRef.current) {
            context.playingAudioRef.current.play();
          }
        },
      );
      return;
    }
    // If the audio is ready to be played, play it
    setIsPlaying(true);
    await context.playingAudioRef.current.play();
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

  // Updates the current time state of the playing audio
  const updateCurrentTime = useCallback(() => {
    if (!context.playingAudioRef.current) {
      setCurrentTime(0);
      return;
    }
    const currentTimeRef = context.playingAudioRef.current.currentTime;
    setCurrentTime(currentTimeRef || 0);
  }, [context.playingAudioRef, setCurrentTime]);

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
    async (newAudio: AudioElementState) => {
      if (context.playingAudioRef.current && newAudio.playOnLoad) {
        context.playingAudioRef.current.addEventListener(
          'loadedmetadata',
          () => {
            if (context.playingAudioRef.current) {
              context.playingAudioRef.current.play();
              setIsPlaying(true);
            }
          },
        );
      }
      if (!context.playingAudioRef.current) return;
      context.playingAudioRef.current.src = newAudio.src;
      context.playingAudioRef.current.currentTime = newAudio.currentTime;
      context.playingAudioRef.current.onended = newAudio.onEnded;
      updateCurrentTime();
    },
    [context, updateCurrentTime],
  );

  const preloadAudio = useCallback(
    async (newQueue: { english: string; spanish: string }) => {
      // If the context Audio Elements are not set, return null values
      if (
        !context.englishParseAudioRef.current ||
        !context.spanishParseAudioRef.current
      ) {
        return {
          englishDuration: null,
          spanishDuration: null,
        };
      }
      // Update the source of the audio elements
      context.englishParseAudioRef.current.src = newQueue.english;
      context.spanishParseAudioRef.current.src = newQueue.spanish;

      // Get the duration of the audio elements
      const [englishDuration, spanishDuration] = await Promise.all([
        getAudioDuration(context.englishParseAudioRef.current),
        getAudioDuration(context.spanishParseAudioRef.current),
      ]);
      // Return the duration of the audio elements
      return {
        englishDuration,
        spanishDuration,
      };
    },
    [context.englishParseAudioRef, context.spanishParseAudioRef],
  );

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
  }, [context.playingAudioRef, isPlaying, updateCurrentTime, pause, play]);

  return {
    play,
    pause,
    isPlaying,
    currentTime,
    changeCurrentAudio,
    preloadAudio,
  };
}
