import type { JSX, MouseEvent } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './AudioQuizPlayButton.module.scss';

interface AudioQuizPlayButtonProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

/**
 * The 44px tinted circle that is the card's only audio control — no volume
 * icons, no status text (handoff: "This is the only audio control anywhere
 * on the card"). Distinct from `CardAudioButton` (text quiz): that renders
 * its own `<audio>` element and plays a fixed clip; this one is a pure
 * play/pause toggle over audio the parent hook already owns and drives.
 * Always stops propagation so it never triggers the card's tap-to-advance.
 */
export function AudioQuizPlayButton({
  isPlaying,
  onPlay,
  onPause,
}: AudioQuizPlayButtonProps): JSX.Element {
  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  }

  return (
    <button
      type="button"
      className={styles.root}
      onClick={handleClick}
      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
    >
      <Icon
        name={isPlaying ? 'playerPause' : 'playerPlay'}
        size="lg"
        tone="inherit"
      />
    </button>
  );
}
