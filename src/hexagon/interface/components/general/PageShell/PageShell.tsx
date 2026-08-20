import type { JSX, ReactNode } from 'react';
import styles from './PageShell.module.scss';

interface PageShellProps {
  children: ReactNode;
  /** Reserve space at the bottom for a FixedBottomStack. */
  reserveBottomBar?: boolean;
  /**
   * Skip the shell's horizontal gutters and 1240 column. The child owns
   * padding and measure. Defaults to the outer-pad + max-width column.
   */
  flushHorizontal?: boolean;
}

/**
 * Outermost element of a v2 surface. `UiScope` is `display: contents` and
 * cannot paint, so this is what establishes the page background, the centered
 * measure, and the v2 font.
 */
export function PageShell({
  children,
  reserveBottomBar = false,
  flushHorizontal = false,
}: PageShellProps): JSX.Element {
  const className = [
    styles.root,
    reserveBottomBar ? styles.reserveBottomBar : undefined,
    flushHorizontal ? styles.flushHorizontal : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <div className={styles.column}>{children}</div>
    </div>
  );
}
