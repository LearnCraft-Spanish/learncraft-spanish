import type { JSX, ReactNode } from 'react';
import styles from './Badge.module.scss';

type BadgeTone = 'label' | 'action' | 'error' | 'success' | 'warning';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** `sm` is the 10px size used inside a menu row. */
  size?: 'sm' | 'md';
  /**
   * Tight 2×8 padding and weight 500. Used inside a list-density menu
   * row. Default keeps 4×6 / 900.
   */
  compact?: boolean;
}

/** Uppercase status pill. `label` is the "ADMIN ONLY" marker. */
export function Badge({
  children,
  tone = 'label',
  size = 'md',
  compact = false,
}: BadgeProps): JSX.Element {
  const className = [
    styles.root,
    styles[tone],
    size === 'sm' ? styles.sm : undefined,
    compact ? styles.compact : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={className}>{children}</span>;
}
