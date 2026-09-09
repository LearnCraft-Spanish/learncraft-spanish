import type { JSX } from 'react';
import { AudioKeyboardHints } from '@interface/components/audioQuiz/AudioKeyboardHints';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './AudioQuizDock.module.scss';

interface AudioQuizDockProps {
  primaryLabel: string;
  replayLabel: string;
  /** Disables `Previous card` on the deck's first card. */
  isFirst: boolean;
  onPrimary: () => void;
  onReplay: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

/**
 * The dock below the card. Mobile stacks primary (52px) above replay
 * (44px outline) above the previous/next row; desktop puts replay (220px)
 * and primary side by side, then previous/next with the keyboard legend
 * pinned right. The DOM order is replay-then-primary in both cases —
 * mobile flips it visually with `flex-direction: column-reverse` rather
 * than duplicating markup.
 */
export function AudioQuizDock({
  primaryLabel,
  replayLabel,
  isFirst,
  onPrimary,
  onReplay,
  onPrevious,
  onNext,
}: AudioQuizDockProps): JSX.Element {
  return (
    <div className={styles.root}>
      <div className={styles.primaryRow}>
        <button type="button" className={styles.replay} onClick={onReplay}>
          <Icon name="rotate" tone="inherit" size="sm" />
          {replayLabel}
        </button>
        <button type="button" className={styles.primary} onClick={onPrimary}>
          {primaryLabel}
          <Icon name="chevronRight" tone="inherit" size="sm" />
        </button>
      </div>

      <div className={styles.navRow}>
        <button
          type="button"
          className={styles.previous}
          disabled={isFirst}
          onClick={onPrevious}
        >
          <Icon name="chevronLeft" tone="inherit" size="sm" />
          Previous card
        </button>
        <button type="button" className={styles.next} onClick={onNext}>
          Next card
          <Icon name="chevronRight" tone="inherit" size="sm" />
        </button>
        <AudioKeyboardHints />
      </div>
    </div>
  );
}
