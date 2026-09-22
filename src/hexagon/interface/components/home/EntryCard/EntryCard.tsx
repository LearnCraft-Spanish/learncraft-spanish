import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX, ReactNode } from 'react';
import { Card } from '@interface/components/general/Card/Card';
import { Icon } from '@interface/components/general/Icon/Icon';
import { IconTile } from '@interface/components/general/IconTile/IconTile';
import styles from './EntryCard.module.scss';

interface EntryCardBaseProps {
  icon: IconName;
  title: string;
  meta: string;
}

interface EntryCardButtonProps extends EntryCardBaseProps {
  onGo: () => void;
  href?: never;
}

interface EntryCardLinkProps extends EntryCardBaseProps {
  href: string;
  onGo?: never;
}

type EntryCardProps = EntryCardButtonProps | EntryCardLinkProps;

/** One tappable row on the home screen: a top line with a leading icon tile
 * and a trailing chevron, then a left-aligned title and meta line below.
 * Built on the shared `Card` primitive for the border/radius only — the
 * bar's "no shadows on press states" rule rules out `Card`'s own
 * `interactive` hover-lift shadow, so hover feedback here is a plain
 * background tint instead. A full-bleed reset button (or anchor for
 * external links) inside makes the whole tile one keyboard-reachable
 * target. */
export function EntryCard({
  icon,
  title,
  meta,
  onGo,
  href,
}: EntryCardProps): JSX.Element {
  const body: ReactNode = (
    <>
      <span className={styles.top}>
        <IconTile icon={icon} />
        <Icon name="chevronRight" size="sm" tone="muted" />
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.meta}>{meta}</span>
    </>
  );

  return (
    <Card>
      {href !== undefined ? (
        <a
          className={styles.hitArea}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {body}
        </a>
      ) : (
        <button type="button" className={styles.hitArea} onClick={onGo}>
          {body}
        </button>
      )}
    </Card>
  );
}
