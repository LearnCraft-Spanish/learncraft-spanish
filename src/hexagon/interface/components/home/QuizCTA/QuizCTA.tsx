import type { JSX } from 'react';
import { BrandMark } from '@interface/components/general/BrandMark/BrandMark';
import { Eyebrow } from '@interface/components/general/Eyebrow/Eyebrow';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './QuizCTA.module.scss';

interface QuizCTAProps {
  headline: string;
  eyebrow: string;
  onGo: () => void;
}

/**
 * The home CTA. One card, one target: the headline is the action, so there
 * is no separate button, no page title above it, and no due-count/time
 * subtitle. The suggested-tool eyebrow sits under the headline inside the
 * dark plate. Sizes are set entirely by CSS at the 768px breakpoint —
 * there is no `compact` prop, since nothing here changes structurally
 * between the two, only measurements.
 */
export function QuizCTA({
  headline,
  eyebrow,
  onGo,
}: QuizCTAProps): JSX.Element {
  return (
    <button type="button" className={styles.root} onClick={onGo}>
      <span className={styles.copy}>
        <span className={styles.headline}>{headline}</span>
        <span className={styles.eyebrow}>
          <Eyebrow tone="onDark">{eyebrow}</Eyebrow>
        </span>
      </span>
      <span className={styles.arrowSlot}>
        <BrandMark size={340} color="var(--lcs-color-brandmark-on-dark)" />
        <span className={styles.arrow}>
          <Icon name="arrowRight" size="lg" tone="onAction" />
        </span>
      </span>
    </button>
  );
}
