import type { IconName } from '@interface/components/general/Icon/Icon';
import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import { useRef } from 'react';
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
  /**
   * Shows a trailing clear button whenever the field has text. Focus returns
   * to the field after it fires.
   */
  onClear?: () => void;
  /** Accessible name for the clear button, e.g. "Clear tag search". */
  clearLabel?: string;
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
  onClear,
  clearLabel = 'Clear',
}: TextInputProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const clearable = onClear !== undefined && !disabled;
  const showClear = clearable && value.length > 0;

  const className = [
    styles.input,
    leadingIcon !== undefined ? styles.withIcon : undefined,
    clearable ? styles.withClear : undefined,
    invalid ? styles.invalid : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  function clear(): void {
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <span className={styles.wrapper}>
      {leadingIcon !== undefined && (
        <span className={styles.icon}>
          <Icon name={leadingIcon} size="md" tone="muted" />
        </span>
      )}
      <input
        ref={inputRef}
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
      {showClear && (
        <span className={styles.clear}>
          <IconButton icon="x" label={clearLabel} size="sm" onClick={clear} />
        </span>
      )}
    </span>
  );
}
