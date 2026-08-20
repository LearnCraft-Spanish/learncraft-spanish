import type {
  IconName,
  IconTone,
} from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './IconTile.module.scss';

type IconTileTone = 'action' | 'label' | 'warning';

const GLYPH_TONE: Record<IconTileTone, IconTone> = {
  action: 'action',
  label: 'onLabel',
  warning: 'warningInk',
};

interface IconTileProps {
  icon: IconName;
  tone?: IconTileTone;
}

/** Tinted square behind an icon. Leads a menu row or a list item. */
export function IconTile({
  icon,
  tone = 'action',
}: IconTileProps): JSX.Element {
  return (
    <span className={`${styles.root} ${styles[tone]}`}>
      <Icon name={icon} size="sm" tone={GLYPH_TONE[tone]} />
    </span>
  );
}
