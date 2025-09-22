import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import pause from 'src/assets/icons/pause_dark.svg';
import play from 'src/assets/icons/play_dark.svg';
import './AudioControl.scss';

export default function AudioControl({ audioLink }: { audioLink: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isValidAudio = useMemo(() => {
    const urlRegex = /^https?:\/\/.+\.(?:mp3|wav|ogg|m4a)$/i;
    if (!audioLink) {
      return true;
    } else {
      return urlRegex.test(audioLink);
    }
  }, [audioLink]);

  async function playAudio() {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  }
  function pauseAudio() {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        setIsPlaying(false);
      } catch (error) {
        console.error('Error pausing audio:', error);
      }
    }
  }

  function handlePlayPauseClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  // Event handler for when audio ends
  const handleEnded = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  // Callback ref to set up event listeners when audio element is available
  const setAudioRef = useCallback(
    (node: HTMLAudioElement | null) => {
      // Remove event listener from previous audio element
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }

      // Set the ref
      audioRef.current = node;

      // Add event listener to new audio element
      if (node) {
        node.addEventListener('ended', handleEnded);
      }
    },
    [handleEnded],
  );

  // Reset playing state when audio link changes
  useEffect(() => {
    // When the audio source changes, we want to reset to the paused state
    // This prevents the UI from showing "pause" when a different audio is loaded
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, [audioLink]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [handleEnded]);

  return (
    audioLink &&
    audioLink.length > 0 && (
      <>
        {isValidAudio && (
          <>
            <audio ref={setAudioRef} src={audioLink}></audio>
            <button
              type="button"
              onClick={(e) => handlePlayPauseClick(e)}
              className="audioControlPlayPauseButton"
              aria-label="Play/Pause"
            >
              <img src={isPlaying ? pause : play} alt="play/pause" />
            </button>
          </>
        )}
        {!isValidAudio && (
          <>
            <button
              type="button"
              className="disabledButton audioError"
              aria-label="audioError"
            >
              <img src={isPlaying ? pause : play} alt="audioError" />
            </button>
          </>
        )}
      </>
    )
  );
}
