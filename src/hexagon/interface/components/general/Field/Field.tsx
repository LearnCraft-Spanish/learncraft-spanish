import type { JSX, ReactElement, ReactNode } from 'react';
import { cloneElement, isValidElement } from 'react';
import styles from './Field.module.scss';

interface FieldProps {
  /** Control id. Ties the label, hint, and error to the input. */
  htmlFor: string;
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
}

interface NativeControlProps {
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

interface PrimitiveControlProps {
  describedBy?: string;
  invalid?: boolean;
}

function describedById(
  htmlFor: string,
  hint: string | undefined,
  error: string | undefined,
): string | undefined {
  if (error !== undefined) {
    return `${htmlFor}-error`;
  }
  if (hint !== undefined) {
    return `${htmlFor}-hint`;
  }
  return undefined;
}

function injectFieldControlProps(
  children: ReactNode,
  describedBy: string | undefined,
  invalid: boolean,
): ReactNode {
  if (!isValidElement(children)) {
    return children;
  }

  if (typeof children.type === 'string') {
    const native = children as ReactElement<NativeControlProps>;
    return cloneElement(native, {
      ...(describedBy !== undefined ? { 'aria-describedby': describedBy } : {}),
      ...(invalid ? { 'aria-invalid': true } : {}),
    });
  }

  const control = children as ReactElement<PrimitiveControlProps>;
  return cloneElement(control, {
    ...(describedBy !== undefined ? { describedBy } : {}),
    ...(invalid ? { invalid: true } : {}),
  });
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
  const describedBy = describedById(htmlFor, hint, error);

  return (
    <div className={styles.root}>
      <label className={labelClassName} htmlFor={htmlFor}>
        {label}
      </label>
      {injectFieldControlProps(children, describedBy, error !== undefined)}
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
