import type { JSX, ReactNode } from 'react';
import styles from './PageShell.module.scss';

interface PageShellProps {
  children: ReactNode;
  /** Reserve space at the bottom for a FixedBottomStack. */
  reserveBottomBar?: boolean;
}

/**
 * Outermost element of a v2 surface. `UiScope` is `display: contents` and
 * cannot paint, so this is what establishes the page background, the centered
 * measure, and the v2 font.
 */
export function PageShell({
  children,
  reserveBottomBar = false,
}: PageShellProps): JSX.Element {
  const className = reserveBottomBar
    ? `${styles.root} ${styles.reserveBottomBar}`
    : styles.root;

  return (
    <div className={className}>
      <div className={styles.column}>{children}</div>
    </div>
  );
}
