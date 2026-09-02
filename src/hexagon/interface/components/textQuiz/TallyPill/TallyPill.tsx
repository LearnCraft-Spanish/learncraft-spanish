import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './TallyPill.module.scss';

type TallyPillTone = 'error' | 'success';

interface TallyPillProps {
  tone: TallyPillTone;
  icon: IconName;
  count: number;
  /** Accessible name, e.g. "7 cards graded hard". */
  label: string;
  /** Which edge of the card it flanks. Desktop only — hidden below 769px. */
  side: 'left' | 'right';
}

/**
 * SRS-only. Desktop pill flanking the card. The mobile equivalent lives in
 * `QuizProgressHeader`, whose flatter chip reads better in a text row.
 */
export function TallyPill({
  tone,
  icon,
  count,
  label,
  side,
}: TallyPillProps): JSX.Element {
  const className = [styles.root, styles[tone], styles[side]].join(' ');

  return (
    <div className={className} role="status" aria-label={label}>
      {/* `inherit` picks up the tone color set on `.root` below — `Icon`
       * has no `success` tone, only `error`. */}
      <Icon name={icon} tone="inherit" />
      <span className={styles.count}>{count}</span>
    </div>
  );
}
