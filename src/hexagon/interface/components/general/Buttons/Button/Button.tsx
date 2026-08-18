import type { JSX, ReactNode } from 'react';
import styles from './Button.module.scss';

interface ButtonProps {
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({
  children,
  type = 'button',
  disabled,
  onClick,
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={styles.root}
    >
      {children}
    </button>
  );
}
