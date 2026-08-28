import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './TabBar.module.scss';

export interface TabBarItem {
  id: string;
  icon: IconName;
  label: string;
  active?: boolean;
  onSelect: () => void;
}

interface TabBarProps {
  items: TabBarItem[];
}

/**
 * Persistent bottom navigation, mobile only — hidden at 769px and up by CSS.
 * New pattern for this app: previously nothing pinned the viewport bottom on
 * small screens. Fixed to the viewport, not the page column.
 */
export function TabBar({ items }: TabBarProps): JSX.Element {
  return (
    <nav className={styles.root} aria-label="Primary">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={styles.tab}
          aria-current={item.active ? 'page' : undefined}
          onClick={item.onSelect}
        >
          <Icon
            name={item.icon}
            size="lg"
            tone={item.active ? 'action' : 'muted'}
          />
          <span className={item.active ? styles.labelActive : styles.label}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
