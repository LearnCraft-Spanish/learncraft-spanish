import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './HelpRow.module.scss';

interface HelpRowProps {
  onGo: () => void;
}

/**
 * Low-emphasis entry to the FAQ / video walkthroughs page. Deliberately not
 * a card — it should read as a footer-level link, findable but out of the
 * way, below the entry cards.
 */
export function HelpRow({ onGo }: HelpRowProps): JSX.Element {
  return (
    <button type="button" className={styles.root} onClick={onGo}>
      <Icon name="book" size="sm" tone="muted" />
      <span className={styles.label}>Help &amp; walkthroughs</span>
      <span className={styles.hint}>FAQ and short video guides</span>
      <Icon name="chevronRight" size="sm" tone="muted" />
    </button>
  );
}
