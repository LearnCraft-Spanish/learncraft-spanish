import type {
  IconName,
  IconSize,
} from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './IconButton.module.scss';

type IconButtonTone = 'muted' | 'action' | 'onDark' | 'steel';

interface IconButtonProps {
  icon: IconName;
  /** Accessible name. Required — the button has no visible text. */
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  /** `bare` for in-row controls, `outlined` for standalone controls. */
  variant?: 'bare' | 'outlined';
  /** `fit` sizes to the glyph; `sm`/`md` are 32 and 40 squares. */
  size?: 'sm' | 'md' | 'fit';
  tone?: IconButtonTone;
  /**
   * Marks the button as a toggle and reports its state. Pressed renders in the
   * action color, e.g. the audio clip currently playing. Leave undefined for
   * buttons that are not toggles.
   */
  active?: boolean;
  iconSize?: IconSize;
}

export function IconButton({
  icon,
  label,
  onClick,
  disabled,
  variant = 'bare',
  size = 'md',
  tone = 'muted',
  active,
  iconSize = 'md',
}: IconButtonProps): JSX.Element {
  const className = [styles.root, styles[size], styles[variant], styles[tone]]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
    >
      <Icon name={icon} size={iconSize} tone={active ? 'action' : tone} />
    </button>
  );
}
