import type { JSX } from 'react';
import styles from './Toggle.module.scss';

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Hide the label visually when the surrounding text already names it. */
  labelHidden?: boolean;
  disabled?: boolean;
}

/** 40x22 switch. The whole row, label included, is the hit target. */
export function Toggle({
  id,
  checked,
  onChange,
  label,
  labelHidden = false,
  disabled = false,
}: ToggleProps): JSX.Element {
  const trackClassName = [styles.track, checked ? styles.on : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={styles.root} htmlFor={id}>
      <span className={labelHidden ? styles.labelHidden : styles.label}>
        {label}
      </span>
      {/*
       * The input stays immediately before .track (not before the label)
       * so the `.input:focus-visible + .track` sibling selector below
       * keeps working. It's visually hidden and absolutely positioned,
       * so it's removed from flex flow and its position here doesn't
       * affect the visible label-then-switch order.
       */}
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={trackClassName} aria-hidden="true">
        <span className={styles.knob} />
      </span>
    </label>
  );
}
