import type { JSX } from 'react';
import { Icon } from '@interface/components/general/Icon/Icon';
import styles from './Checkbox.module.scss';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Hide the label visually, e.g. a row-select box in a table. */
  labelHidden?: boolean;
  disabled?: boolean;
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
  labelHidden = false,
  disabled = false,
}: CheckboxProps): JSX.Element {
  const boxClassName = [styles.box, checked ? styles.checked : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={styles.root} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={boxClassName} aria-hidden="true">
        {checked && <Icon name="check" size="sm" tone="onAction" />}
      </span>
      <span className={labelHidden ? styles.labelHidden : styles.label}>
        {label}
      </span>
    </label>
  );
}
