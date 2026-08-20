import type { JSX } from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
  /** Number of placeholder bars. */
  count?: number;
  /** Accessible description of what is loading. */
  label: string;
}

/** Loading placeholder for a content area. Never use a spinner inside one. */
export function Skeleton({ count = 3, label }: SkeletonProps): JSX.Element {
  return (
    <div className={styles.root} role="status" aria-label={label} aria-busy>
      {Array.from({ length: count }, (_, index) => (
        <span className={styles.bar} key={index} />
      ))}
    </div>
  );
}
