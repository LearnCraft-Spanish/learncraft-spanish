import type { JSX } from 'react';
import {
  IconArrowRight,
  IconBell,
  IconBolt,
  IconBook,
  IconBookmark,
  IconBrain,
  IconCards,
  IconCheck,
  IconChecklist,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconClipboard,
  IconClipboardCopy,
  IconFilter,
  IconHome,
  IconLanguage,
  IconLogout,
  IconPlus,
  IconSearch,
  IconSearchOff,
  IconTrophy,
  IconUser,
  IconUserStar,
  IconVolume,
  IconX,
} from '@tabler/icons-react';
import styles from './Icon.module.scss';

/**
 * The only place in the app that imports an icon package. Call sites name an
 * icon by string, so swapping the underlying set is a change to this map.
 * Register an icon here before using it.
 */
const GLYPHS = {
  arrowRight: IconArrowRight,
  bell: IconBell,
  bolt: IconBolt,
  book: IconBook,
  bookmark: IconBookmark,
  brain: IconBrain,
  cards: IconCards,
  check: IconCheck,
  checklist: IconChecklist,
  chevronDown: IconChevronDown,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,
  chevronUp: IconChevronUp,
  clipboard: IconClipboard,
  clipboardCopy: IconClipboardCopy,
  filter: IconFilter,
  home: IconHome,
  language: IconLanguage,
  logout: IconLogout,
  plus: IconPlus,
  search: IconSearch,
  searchOff: IconSearchOff,
  trophy: IconTrophy,
  user: IconUser,
  userStar: IconUserStar,
  volume: IconVolume,
  x: IconX,
} as const;

export type IconName = keyof typeof GLYPHS;

/**
 * 14px inline with text, 16px in tiles, 18px default, 22px in navigation,
 * 28px as the glyph of an empty state.
 */
export type IconSize = 'inline' | 'sm' | 'md' | 'lg' | 'xl';

export type IconTone =
  | 'inherit'
  | 'action'
  | 'onAction'
  | 'muted'
  | 'label'
  | 'onLabel'
  | 'steel'
  | 'onDark'
  | 'error'
  | 'warning'
  | 'warningInk';

const SIZES: Record<IconSize, number> = {
  inline: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 28,
};

// Tabler outline at its native weight, settled against the handoff's competing
// suggestion of Lucide at 1.5. Filled variants are never used.
const STROKE_WIDTH = 2;

interface IconProps {
  name: IconName;
  size?: IconSize;
  tone?: IconTone;
  /**
   * Accessible name. Leave undefined for decorative icons, which are then
   * hidden from assistive technology.
   */
  label?: string;
}

export function Icon({
  name,
  size = 'md',
  tone = 'inherit',
  label,
}: IconProps): JSX.Element {
  const Glyph = GLYPHS[name];
  const decorative = label === undefined;

  return (
    <Glyph
      className={`${styles.root} ${styles[tone]}`}
      size={SIZES[size]}
      stroke={STROKE_WIDTH}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={label}
    />
  );
}
