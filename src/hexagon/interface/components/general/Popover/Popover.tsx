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
}

export function Popover({
  open,
  onDismiss,
  trigger,
  children,
  skin = 'light',
  align = 'start',
}: PopoverProps): JSX.Element {
  const { containerRef } = useDismissable(open, onDismiss);

  const panelClassName = [
    styles.panel,
    styles[skin],
    align === 'end' ? styles.alignEnd : undefined,
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
