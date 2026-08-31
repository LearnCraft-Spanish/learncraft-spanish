import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { Card } from '@interface/components/general/Card/Card';
import { Icon } from '@interface/components/general/Icon/Icon';
import { IconTile } from '@interface/components/general/IconTile/IconTile';
import styles from './EntryCard.module.scss';

interface EntryCardProps {
  icon: IconName;
  title: string;
  meta: string;
  onGo: () => void;
}

/** One tappable row on the home screen: a top line with a leading icon tile
 * and a trailing chevron, then a left-aligned title and meta line below.
 * Built on the shared `Card` primitive for the border/radius only — the
 * bar's "no shadows on press states" rule rules out `Card`'s own
 * `interactive` hover-lift shadow, so hover feedback here is a plain
 * background tint instead. A full-bleed reset button inside makes the
 * whole tile one keyboard-reachable target. */
export function EntryCard({
  icon,
  title,
  meta,
  onGo,
}: EntryCardProps): JSX.Element {
  return (
    <Card>
      <button type="button" className={styles.hitArea} onClick={onGo}>
        <span className={styles.top}>
          <IconTile icon={icon} />
          <Icon name="chevronRight" size="sm" tone="muted" />
        </span>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>{meta}</span>
      </button>
    </Card>
  );
}
