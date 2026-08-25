import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX, ReactNode } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  guidance: string;
  /** One control that removes the most likely cause of the emptiness. */
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  guidance,
  action,
}: EmptyStateProps): JSX.Element {
  return (
    <div className={styles.root}>
      <Icon name={icon} size="xl" tone="muted" />
      <p className={styles.title}>{title}</p>
      <p className={styles.guidance}>{guidance}</p>
      {action}
    </div>
  );
}
