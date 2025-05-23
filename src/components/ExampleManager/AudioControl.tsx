import { useMemo, useRef, useState } from 'react';
import pause from 'src/assets/icons/pause_dark.svg';
import play from 'src/assets/icons/play_dark.svg';

export function AudioControl({ audioLink }: { audioLink: string }) {
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
  return (
    audioLink &&
    audioLink.length > 0 && (
      <>
        {isValidAudio && (
          <>
            <audio ref={audioRef} src={audioLink}></audio>
            <button
              type="button"
              onClick={(e) => handlePlayPauseClick(e)}
              className="audioPlayPauseButton"
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
