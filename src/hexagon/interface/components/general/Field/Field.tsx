import type { JSX, ReactNode } from 'react';
import styles from './Field.module.scss';

interface FieldProps {
  /** Control id. Ties the label, hint, and error to the input. */
  htmlFor: string;
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}

/**
 * Label, control, and message for one form control. Requiredness is shown by
 * a Green Smoke group eyebrow ("SCOPE · REQUIRED"), never an asterisk.
 */
export function Field({
  htmlFor,
  label,
  children,
  hint,
  error,
}: FieldProps): JSX.Element {
  const labelClassName = [styles.label, error ? styles.labelError : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.root}>
      <label className={labelClassName} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint !== undefined && error === undefined && (
        <span className={styles.hint} id={`${htmlFor}-hint`}>
          {hint}
        </span>
      )}
      {error !== undefined && (
        <span className={styles.error} id={`${htmlFor}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
