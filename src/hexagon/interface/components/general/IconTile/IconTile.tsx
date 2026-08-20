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
  /**
   * Glyph size. `sm` is 16px everywhere else. `menu` is the 17px glyph
   * inside a list-density actions row.
   */
  glyphSize?: 'sm' | 'menu';
}

/** Tinted square behind an icon. Leads a menu row or a list item. */
export function IconTile({
  icon,
  tone = 'action',
  glyphSize = 'sm',
}: IconTileProps): JSX.Element {
  const className = [
    styles.root,
    styles[tone],
    glyphSize === 'menu' ? styles.menuGlyph : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={className}>
      <Icon name={icon} size="sm" tone={GLYPH_TONE[tone]} />
    </span>
  );
}
