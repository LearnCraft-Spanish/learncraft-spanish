import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './TextInput.module.scss';

interface TextInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  leadingIcon?: IconName;
  invalid?: boolean;
  disabled?: boolean;
  type?: 'text' | 'search';
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  leadingIcon,
  invalid = false,
  disabled = false,
  type = 'text',
}: TextInputProps): JSX.Element {
  const className = [
    styles.input,
    leadingIcon !== undefined ? styles.withIcon : undefined,
    invalid ? styles.invalid : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={styles.wrapper}>
      {leadingIcon !== undefined && (
        <span className={styles.icon}>
          <Icon name={leadingIcon} size="md" tone="muted" />
        </span>
      )}
      <input
        id={id}
        type={type}
        className={className}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </span>
  );
}
