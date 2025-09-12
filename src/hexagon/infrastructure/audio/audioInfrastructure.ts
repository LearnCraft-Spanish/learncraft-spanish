import type {
  AudioElementState,
  AudioPort,
} from '@application/ports/audioPort';
import { AudioContext } from '@composition/context/AudioContext';
import { use, useCallback, useEffect, useRef, useState } from 'react';

// Helper function to convert AudioBuffer to WAV blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;

  const buffer32 = new ArrayBuffer(
    44 + buffer.length * numberOfChannels * bytesPerSample,
  );
  const view = new DataView(buffer32);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(
    4,
    36 + buffer.length * numberOfChannels * bytesPerSample,
    true,
  );
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, buffer.length * numberOfChannels * bytesPerSample, true);

  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(
        -1,
        Math.min(1, buffer.getChannelData(channel)[i]),
      );
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true,
      );
      offset += 2;
    }
  }

  return new Blob([buffer32], { type: 'audio/wav' });
}

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

  const concatenateAudioWithPadding = useCallback(
    async (mainAudioUrl: string, paddingAudioUrl: string) => {
      try {
        // Create audio context
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();

        // Fetch both audio files
        const [mainResponse, paddingResponse] = await Promise.all([
          fetch(mainAudioUrl),
          fetch(paddingAudioUrl),
        ]);

        const [mainArrayBuffer, paddingArrayBuffer] = await Promise.all([
          mainResponse.arrayBuffer(),
          paddingResponse.arrayBuffer(),
        ]);

        // Decode audio data
        const [mainAudioBuffer, paddingAudioBuffer] = await Promise.all([
          audioContext.decodeAudioData(mainArrayBuffer),
          audioContext.decodeAudioData(paddingArrayBuffer),
        ]);

        // Calculate total duration and create concatenated buffer
        // Ensure we only use exactly 3 seconds of padding (PADDING_DURATION)
        const PADDING_DURATION = 3;
        const paddingDurationToUse = Math.min(
          paddingAudioBuffer.duration,
          PADDING_DURATION,
        );
        const totalDuration = mainAudioBuffer.duration + paddingDurationToUse;

        const sampleRate = mainAudioBuffer.sampleRate;
        const numberOfChannels = Math.max(
          mainAudioBuffer.numberOfChannels,
          paddingAudioBuffer.numberOfChannels,
        );

        const concatenatedBuffer = audioContext.createBuffer(
          numberOfChannels,
          Math.ceil(totalDuration * sampleRate),
          sampleRate,
        );

        // Copy main audio data
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const concatenatedData = concatenatedBuffer.getChannelData(channel);

          // Copy main audio (handle mono to stereo conversion if needed)
          const mainChannelData = mainAudioBuffer.getChannelData(
            Math.min(channel, mainAudioBuffer.numberOfChannels - 1),
          );
          concatenatedData.set(mainChannelData, 0);

          // Copy padding audio (only the duration we need)
          const paddingChannelData = paddingAudioBuffer.getChannelData(
            Math.min(channel, paddingAudioBuffer.numberOfChannels - 1),
          );
          const paddingSamplesToCopy = Math.ceil(
            paddingDurationToUse * sampleRate,
          );
          const paddingDataToCopy = paddingChannelData.slice(
            0,
            paddingSamplesToCopy,
          );
          concatenatedData.set(paddingDataToCopy, mainAudioBuffer.length);
        }

        // Convert to WAV blob
        const wavBlob = audioBufferToWav(concatenatedBuffer);
        const concatenatedAudioUrl = URL.createObjectURL(wavBlob);

        // Cleanup function to revoke object URL
        const cleanup = () => {
          URL.revokeObjectURL(concatenatedAudioUrl);
          audioContext.close();
        };

        return {
          concatenatedAudioUrl,
          totalDuration, // This now reflects the actual duration used (main + exactly 3s padding)
          cleanup,
        };
      } catch (error) {
        console.error('Failed to concatenate audio:', error);
        throw error;
      }
    },
    [],
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
    concatenateAudioWithPadding,
  };
}
