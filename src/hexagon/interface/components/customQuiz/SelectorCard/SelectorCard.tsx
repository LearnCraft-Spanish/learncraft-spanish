import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import { IconTile } from '@interface/components/general/IconTile/IconTile';
import styles from './SelectorCard.module.scss';

export interface SelectorCardProps {
  icon: IconName;
  label: string;
  selected: boolean;
  onSelect: () => void;
  /**
   * `tile` seats the glyph in a tinted square and grows the label on desktop,
   * for the quiz-type pair. `inline` is the tighter, centered tag-mode card.
   * `compactTile` is that tighter card keeping the tinted square, so the
   * audio-mode pair reads as a sibling of the quiz-type pair above it.
   */
  variant?: 'tile' | 'inline' | 'compactTile';
}

/**
 * One option in a radio pair rendered as cards. Selection is carried by the
 * border and fill rather than a visible radio control.
 */
export function SelectorCard({
  icon,
  label,
  selected,
  onSelect,
  variant = 'tile',
}: SelectorCardProps): JSX.Element {
  const className = [
    styles.root,
    variant === 'tile' ? styles.roomy : styles.compact,
    selected ? styles.on : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={className}
      onClick={onSelect}
    >
      {variant === 'inline' ? (
        <Icon name={icon} tone="action" />
      ) : (
        <IconTile icon={icon} />
      )}
      <span className={styles.label}>{label}</span>
    </button>
  );
}
