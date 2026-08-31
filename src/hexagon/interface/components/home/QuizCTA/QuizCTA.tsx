import type { JSX } from 'react';
import { BrandMark } from '@interface/components/general/BrandMark/BrandMark';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './QuizCTA.module.scss';

interface QuizCTAProps {
  onGo: () => void;
}

/**
 * The home CTA. One card, one target: the headline is the action, so there
 * is no separate button, no page title above it, and no due-count/time
 * subtitle. Sizes are set entirely by CSS at the 768px breakpoint — there is
 * no `compact` prop, since nothing here changes structurally between the
 * two, only measurements.
 */
export function QuizCTA({ onGo }: QuizCTAProps): JSX.Element {
  return (
    <button type="button" className={styles.root} onClick={onGo}>
      <span className={styles.headline}>Quiz my flashcards</span>
      <span className={styles.arrowSlot}>
        <BrandMark size={340} color="var(--lcs-color-brandmark-on-dark)" />
        <span className={styles.arrow}>
          <Icon name="arrowRight" size="lg" tone="onAction" />
        </span>
      </span>
    </button>
  );
}
