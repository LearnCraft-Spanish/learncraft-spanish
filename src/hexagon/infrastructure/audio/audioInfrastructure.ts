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

      const handlePlayOnLoad = () => {
        if (context.playingAudioRef.current) {
          context.playingAudioRef.current.play();
        }
        // Remove this listener after it fires once
        context.playingAudioRef.current?.removeEventListener(
          'loadedmetadata',
          handlePlayOnLoad,
        );
      };
      context.playingAudioRef.current.addEventListener(
        'loadedmetadata',
        handlePlayOnLoad,
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

  const changeCurrentAudio = useCallback(
    async (newAudio: AudioElementState) => {
      if (!context.playingAudioRef.current) return;

      // Remove any existing loadedmetadata listeners to prevent double play
      const audioElement = context.playingAudioRef.current;
      const existingListeners = audioElement.cloneNode(
        true,
      ) as HTMLAudioElement;
      audioElement.replaceWith(existingListeners);
      context.playingAudioRef.current = existingListeners;

      // Set up new audio properties
      context.playingAudioRef.current.src = newAudio.src;
      context.playingAudioRef.current.currentTime = newAudio.currentTime;
      context.playingAudioRef.current.onended = newAudio.onEnded;

      // Add single loadedmetadata listener if playOnLoad is true
      if (newAudio.playOnLoad) {
        setIsPlaying(true);

        const handleLoadedMetadata = () => {
          if (context.playingAudioRef.current) {
            context.playingAudioRef.current.play();
          }
          // Remove this listener after it fires once
          context.playingAudioRef.current?.removeEventListener(
            'loadedmetadata',
            handleLoadedMetadata,
          );
        };
        context.playingAudioRef.current.addEventListener(
          'loadedmetadata',
          handleLoadedMetadata,
        );
      }

      updateCurrentTime();
    },
    [context, updateCurrentTime],
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
  };
}
