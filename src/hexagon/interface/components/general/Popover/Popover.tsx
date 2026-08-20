import type { JSX, ReactNode } from 'react';
import { useDismissable } from '@interface/components/general/Popover/useDismissable';
import styles from './Popover.module.scss';

interface PopoverProps {
  open: boolean;
  onDismiss: () => void;
  /** The control the panel hangs from. Stays rendered while closed. */
  trigger: ReactNode;
  children: ReactNode;
  /** `dark` is the Deep Navy skin used by vocabulary detail popovers. */
  skin?: 'light' | 'dark';
  /** Anchor the panel to the trigger's right edge. */
  align?: 'start' | 'end';
  /**
   * Light skin defaults to `--lcs-shadow-popover`. Pass `menu` for the
   * heavier actions-menu shadow. Dark skin already uses the menu shadow.
   */
  shadow?: 'popover' | 'menu';
  /**
   * Gap below the trigger. Default is 6px (`--lcs-space-2`). `menu` is
   * 10px (`--lcs-space-4`) for the flush actions list.
   */
  offset?: 'default' | 'menu';
}

export function Popover({
  open,
  onDismiss,
  trigger,
  children,
  skin = 'light',
  align = 'start',
  shadow,
  offset = 'default',
}: PopoverProps): JSX.Element {
  const { containerRef } = useDismissable(open, onDismiss);

  const panelClassName = [
    styles.panel,
    styles[skin],
    align === 'end' ? styles.alignEnd : undefined,
    shadow === 'menu' ? styles.shadowMenu : undefined,
    shadow === 'popover' ? styles.shadowPopover : undefined,
    offset === 'menu' ? styles.offsetMenu : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.root} ref={containerRef}>
      {trigger}
      {open && <div className={panelClassName}>{children}</div>}
    </div>
  );
}
