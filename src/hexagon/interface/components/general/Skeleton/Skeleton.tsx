import type { JSX } from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
  /** Number of placeholder bars. */
  count?: number;
  /** Accessible description of what is loading. */
  label: string;
  /**
   * Pending-row placeholders at staggered widths. Default bars stay
   * full container width (gallery).
   */
  variant?: 'rows';
}

/** Loading placeholder for a content area. Never use a spinner inside one. */
export function Skeleton({
  count = 3,
  label,
  variant,
}: SkeletonProps): JSX.Element {
  const className = [styles.root, variant === 'rows' ? styles.rows : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} role="status" aria-label={label} aria-busy>
      {Array.from({ length: count }, (_, index) => (
        <span className={styles.bar} key={index} />
      ))}
    </div>
  );
}
