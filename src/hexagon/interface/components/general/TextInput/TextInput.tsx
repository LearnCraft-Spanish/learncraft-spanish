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
  /** Id of the hint or error that describes this input. */
  describedBy?: string;
  disabled?: boolean;
  type?: 'text' | 'search';
  /** Fires when the field gains focus (e.g. clicking back into a search bar). */
  onFocus?: () => void;
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  leadingIcon,
  invalid = false,
  describedBy,
  disabled = false,
  type = 'text',
  onFocus,
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
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
      />
    </span>
  );
}
