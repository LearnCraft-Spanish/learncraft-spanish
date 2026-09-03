import type { JSX, MouseEvent } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import { useRef } from 'react';
import styles from './CardAudioButton.module.scss';

interface CardAudioButtonProps {
  /** `null` means the current face has no audio — nothing renders. */
  audioUrl: string | null;
  label: string;
}

/**
 * The 34×34 tinted tile that plays the current face's sentence audio. Renders
 * nothing when `audioUrl` is null. Never flips the card, so its click handler
 * stops propagation before the card's own click handler ever sees it.
 */
export function CardAudioButton({
  audioUrl,
  label,
}: CardAudioButtonProps): JSX.Element | null {
  const audioRef = useRef<HTMLAudioElement>(null);

  if (audioUrl === null) {
    return null;
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    audioRef.current?.play().catch(() => {
      // Autoplay restrictions or a bad URL are not actionable here.
    });
  }

  return (
    <button
      type="button"
      className={styles.root}
      onClick={handleClick}
      aria-label={label}
    >
      {/* Inherit #449AC2 from the tile — `action` tone read washed in captures.
       * Handoff glyph is 18px (`md`); `sm` (16) read undersized in B-mobile. */}
      <Icon name="volume" size="md" tone="inherit" />
      <audio ref={audioRef} src={audioUrl} />
    </button>
  );
}
