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
  /**
   * Below 768px, `centered` hangs the panel below its nearest positioned
   * ancestor at ~85vw, centered with `left: 50%` + `margin-left: -42.5vw`
   * (margin, not transform — so the shared `rise` animation stays intact).
   * The root also goes `position: static` so a caller can re-anchor against a
   * wider ancestor (e.g. a chip row). Desktop stays trigger-anchored either
   * way. Default keeps menus and filter popovers on their triggers at every
   * width.
   */
  mobilePlacement?: 'anchored' | 'centered';
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
  mobilePlacement = 'anchored',
}: PopoverProps): JSX.Element {
  const { containerRef } = useDismissable(open, onDismiss);

  const rootClassName = [
    styles.root,
    mobilePlacement === 'centered' ? styles.mobileCenteredRoot : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  const panelClassName = [
    styles.panel,
    styles[skin],
    align === 'end' ? styles.alignEnd : undefined,
    shadow === 'menu' ? styles.shadowMenu : undefined,
    shadow === 'popover' ? styles.shadowPopover : undefined,
    offset === 'menu' ? styles.offsetMenu : undefined,
    mobilePlacement === 'centered' ? styles.mobileCentered : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName} ref={containerRef}>
      {trigger}
      {open && <div className={panelClassName}>{children}</div>}
    </div>
  );
}
