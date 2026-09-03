import type { JSX } from 'react';
import styles from './KeyboardHints.module.scss';

interface KeyboardHintsProps {
  srs: boolean;
}

interface HintItem {
  key: string;
  label: string;
}

const SRS_HINTS: HintItem[] = [
  { key: '←', label: 'hard' },
  { key: 'space', label: 'flip' },
  { key: '→', label: 'easy' },
];

const PLAIN_HINTS: HintItem[] = [
  { key: '←', label: 'previous' },
  { key: 'space', label: 'flip' },
  { key: '→', label: 'next' },
];

/**
 * Desktop-only legend for the shortcuts `TextQuizV2` wires up globally.
 * Purely descriptive of behavior that already exists elsewhere, so it is
 * hidden from assistive technology rather than announced as content.
 */
export function KeyboardHints({ srs }: KeyboardHintsProps): JSX.Element {
  const hints = srs ? SRS_HINTS : PLAIN_HINTS;

  return (
    <div className={styles.root} aria-hidden="true">
      {hints.map((hint, index) => (
        <span className={styles.item} key={hint.label}>
          {index > 0 && <span className={styles.sep}>·</span>}
          <kbd className={styles.key}>
            <span
              className={hint.key === 'space' ? styles.strong : styles.muted}
            >
              {hint.key}
            </span>
          </kbd>
          <span>{hint.label}</span>
        </span>
      ))}
    </div>
  );
}
