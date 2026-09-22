import type { JSX } from 'react';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Marks a required scope control with the action border. */
  emphasis?: boolean;
  invalid?: boolean;
  /** Id of the hint or error that describes this control. */
  describedBy?: string;
  disabled?: boolean;
  /**
   * Show the current value as a fixed readout instead of a control. Use when
   * another control has switched this one off.
   */
  readout?: boolean;
}

export function Select({
  id,
  value,
  options,
  onChange,
  emphasis = false,
  invalid = false,
  describedBy,
  disabled = false,
  readout = false,
}: SelectProps): JSX.Element {
  if (readout) {
    const selected = options.find((option) => option.value === value);

    return (
      <input
        id={id}
        className={styles.readout}
        value={selected?.label ?? ''}
        readOnly
        aria-describedby={describedBy}
      />
    );
  }

  const className = [
    styles.root,
    emphasis ? styles.emphasis : undefined,
    invalid ? styles.invalid : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <select
      id={id}
      className={className}
      value={value}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
