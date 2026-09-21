import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX, ReactNode } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './Button.module.scss';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

/** `md` is the 44px standalone control, `sm` the 40px in-row action. */
type ButtonSize = 'md' | 'sm' | 'inline';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Use `onDark` on a Deep Navy surface. */
  tone?: 'default' | 'onDark';
  /** Drops a ghost button to the muted color. Ignored by other variants. */
  muted?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  tone = 'default',
  muted = false,
  leadingIcon,
  trailingIcon,
  type = 'button',
  disabled,
  onClick,
}: ButtonProps): JSX.Element {
  const className = [
    styles.root,
    styles[variant],
    styles[size],
    tone === 'onDark' ? styles.onDark : undefined,
    muted ? styles.muted : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {leadingIcon !== undefined && <Icon name={leadingIcon} size="sm" />}
      {children}
      {trailingIcon !== undefined && <Icon name={trailingIcon} size="sm" />}
    </button>
  );
}
