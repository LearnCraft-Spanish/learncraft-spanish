import type { JSX, ReactNode } from 'react';
import styles from './FixedBottomStack.module.scss';

interface FixedBottomStackProps {
  children: ReactNode;
}

/**
 * Pins notices and a bulk action bar to the bottom of the viewport, stacked in
 * order. Render inside `PageShell` with `reserveBottomBar` so the last row of
 * content is never covered. Deliberately not a portal to `body` — the tokens
 * and page measure follow the shell.
 */
export function FixedBottomStack({
  children,
}: FixedBottomStackProps): JSX.Element {
  return (
    <div className={styles.root}>
      <div className={styles.column}>{children}</div>
    </div>
  );
}
