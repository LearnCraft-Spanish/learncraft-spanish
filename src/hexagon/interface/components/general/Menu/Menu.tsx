import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX, ReactNode } from 'react';
import { Badge } from '@interface/components/general/Badge/Badge';
import { IconTile } from '@interface/components/general/IconTile/IconTile';
import { Popover } from '@interface/components/general/Popover/Popover';
import styles from './Menu.module.scss';

export interface MenuItem {
  id: string;
  icon: IconName;
  label: string;
  hint?: string;
  /** Marker shown beside the label, e.g. "Admin only". */
  badge?: string;
  onSelect: () => void;
}

interface MenuProps {
  open: boolean;
  onDismiss: () => void;
  trigger: ReactNode;
  items: MenuItem[];
  /** Accessible name for the menu itself. */
  label: string;
  align?: 'start' | 'end';
  /**
   * `list` is the flush 330px actions menu: no list gutter, hairline rows,
   * regular-weight labels, menu shadow. Default keeps the padded gallery look.
   */
  density?: 'default' | 'list';
}

/**
 * Icon-tile action list in a popover. Choosing a row runs that item's handler
 * and closes the menu. Callers filter `items` by permission — a row a user
 * may not use is left out rather than disabled.
 */
export function Menu({
  open,
  onDismiss,
  trigger,
  items,
  label,
  align = 'end',
  density = 'default',
}: MenuProps): JSX.Element {
  const listClassName =
    density === 'list' ? `${styles.list} ${styles.listFlush}` : styles.list;

  return (
    <Popover
      open={open}
      onDismiss={onDismiss}
      trigger={trigger}
      align={align}
      shadow={density === 'list' ? 'menu' : undefined}
      offset={density === 'list' ? 'menu' : undefined}
    >
      <ul className={listClassName} aria-label={label}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={styles.item}
              onClick={() => {
                item.onSelect();
                onDismiss();
              }}
            >
              <IconTile
                icon={item.icon}
                glyphSize={density === 'list' ? 'menu' : undefined}
              />
              <span className={styles.body}>
                <span className={styles.labelRow}>
                  <span className={styles.label}>{item.label}</span>
                  {item.badge !== undefined && (
                    <Badge size="sm" compact={density === 'list'}>
                      {item.badge}
                    </Badge>
                  )}
                </span>
                {item.hint !== undefined && (
                  <span className={styles.hint}>{item.hint}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Popover>
  );
}
