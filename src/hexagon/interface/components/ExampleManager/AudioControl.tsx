import pause from 'src/assets/icons/pause_dark.svg';
import play from 'src/assets/icons/play_dark.svg';
import { useAudioControl } from 'src/hexagon/application/units/examples/useAudioControl';

export function AudioControl({ audioLink }: { audioLink: string }) {
  const { isPlaying, isValidAudio, togglePlayPause, audioRef } =
    useAudioControl(audioLink);

  // I think this return value can be simplified. Look into styles & simplification when possible
  return isValidAudio ? (
    <>
      <audio ref={audioRef} src={audioLink}></audio>
      <button
        type="button"
        onClick={(e) => togglePlayPause(e)}
        className="audioPlayPauseButton"
        aria-label="Play/Pause"
      >
        <img src={isPlaying ? pause : play} alt="play/pause" />
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        className="disabledButton audioError"
        aria-label="audioError"
      >
        <img src={isPlaying ? pause : play} alt="audioError" />
      </button>
    </>
  );
}
