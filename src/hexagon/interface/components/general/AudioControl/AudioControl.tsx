import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import pause from 'src/assets/icons/pause_dark.svg';
import play from 'src/assets/icons/play_dark.svg';
import './AudioControl.scss';

export interface AudioControlProps {
  audioLink: string;
  /** Optional callback when audio fails to load */
  onError?: () => void;
  /** Optional callback when audio loads and can play */
  onSuccess?: () => void;
}

export default function AudioControl({
  audioLink,
  onError,
  onSuccess,
}: AudioControlProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // State is computed fresh on each render - no reset needed
  // When audioLink changes, component remounts via key prop
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

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

  // Handle audio loading errors
  const handleError = useCallback(() => {
    setHasLoadError(true);
    onError?.();
  }, [onError]);

  const handleCanPlay = useCallback(() => {
    setHasLoadError(false);
    onSuccess?.();
  }, [onSuccess]);

  // Callback ref to set up event listeners when audio element is available
  const setAudioRef = useCallback(
    (node: HTMLAudioElement | null) => {
      // Remove event listeners from previous audio element
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.removeEventListener('canplay', handleCanPlay);
      }

      // Set the ref
      audioRef.current = node;

      // Add event listeners to new audio element
      if (node) {
        node.addEventListener('ended', handleEnded);
        node.addEventListener('error', handleError);
        node.addEventListener('canplay', handleCanPlay);
      }
    },
    [handleEnded, handleError, handleCanPlay],
  );

  // Reset audio element when audioLink changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [audioLink]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.removeEventListener('canplay', handleCanPlay);
      }
    };
  }, [handleEnded, handleError, handleCanPlay]);

  // Show error state if audio failed to load
  if (hasLoadError && audioLink) {
    return <span style={{ color: '#d32f2f' }}>error</span>;
  }

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
        {!isValidAudio && <span style={{ color: '#d32f2f' }}>error</span>}
      </>
    )
  );
}
