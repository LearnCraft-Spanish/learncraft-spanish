import { useRef, useState } from 'react';
import play from 'src/assets/icons/play_dark.svg';
import pause from 'src/assets/icons/pause_dark.svg';

export function AudioControl({ audioLink }: { audioLink: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
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
    audioLink.length > 0 && (
      <>
        <audio ref={audioRef} src={audioLink}></audio>
        <button
          type="button"
          className="audioPlayPauseButton"
          onClick={(e) => handlePlayPauseClick(e)}
          aria-label="Play/Pause"
        >
          <img src={isPlaying ? pause : play} alt="play/pause" />
        </button>
      </>
    )
  );
}
