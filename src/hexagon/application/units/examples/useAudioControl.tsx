import { useMemo, useRef, useState } from 'react';

export function useAudioControl(audioLink: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isValidAudio = useMemo(() => {
    const urlRegex = /^https?:\/\/.+\.(?:mp3|wav|ogg|m4a)$/i;
    if (!audioLink) {
      return false; // This was true, and more logic was used to determine if rendering component. check and see if this breaks stuff
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

  function togglePlayPause(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }

  return { isPlaying, togglePlayPause, isValidAudio, audioRef };
}
