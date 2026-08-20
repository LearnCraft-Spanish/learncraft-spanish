import type { JSX, ReactNode } from 'react';
import styles from './Badge.module.scss';

type BadgeTone = 'label' | 'action' | 'error' | 'success' | 'warning';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** `sm` is the 10px size used inside a menu row. */
  size?: 'sm' | 'md';
}

/** Uppercase status pill. `label` is the "ADMIN ONLY" marker. */
export function Badge({
  children,
  tone = 'label',
  size = 'md',
}: BadgeProps): JSX.Element {
  const className = [
    styles.root,
    styles[tone],
    size === 'sm' ? styles.sm : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={className}>{children}</span>;
}
