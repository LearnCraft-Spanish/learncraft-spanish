import type { MenuItem } from '@interface/components/general/Menu/Menu';
import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import { Menu } from '@interface/components/general/Menu/Menu';
import { useState } from 'react';
import styles from './ActionsMenu.module.scss';

export interface ActionsMenuProps {
  /** Trigger text and the accessible name of the list. */
  label: string;
  items: MenuItem[];
  /** Extra class on the root, so a surface can size its own trigger. */
  className?: string;
}

/**
 * The results-header actions menu chrome: bolt trigger, chevron that follows
 * the open state, and the popover list. Callers supply the items; nothing
 * here knows what an action does.
 */
export function ActionsMenu({
  label,
  items,
  className,
}: ActionsMenuProps): JSX.Element {
  const [open, setOpen] = useState(false);

  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <div className={rootClassName} data-state={open ? 'open' : 'closed'}>
      <Menu
        open={open}
        onDismiss={() => {
          setOpen(false);
        }}
        align="end"
        density="list"
        label={label}
        trigger={
          <Button
            variant="secondary"
            size="sm"
            leadingIcon="bolt"
            trailingIcon={open ? 'chevronUp' : 'chevronDown'}
            onClick={() => {
              setOpen((isOpen) => !isOpen);
            }}
          >
            {label}
          </Button>
        }
        items={items}
      />
    </div>
  );
}
