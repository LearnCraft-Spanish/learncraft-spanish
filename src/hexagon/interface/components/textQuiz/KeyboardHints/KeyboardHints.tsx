import type { JSX } from 'react';
import styles from './KeyboardHints.module.scss';

interface KeyboardHintsProps {
  srs: boolean;
}

interface HintItem {
  key: string;
  label: string;
}

const NAV_HINTS: HintItem[] = [
  { key: '←', label: 'previous' },
  { key: '↑', label: 'flip' },
  { key: '→', label: 'next' },
];

const SRS_GRADE_HINTS: HintItem[] = [
  { key: '1', label: 'hard' },
  { key: '2', label: 'easy' },
];

/**
 * Desktop-only legend for the shortcuts `TextQuizV2` wires up globally.
 * Left/right are always previous/next. SRS adds `1` hard / `2` easy.
 * Space play/pause is intentionally omitted — it is a hidden shortcut.
 * Purely descriptive, so it is hidden from assistive technology rather
 * than announced as content.
 */
export function KeyboardHints({ srs }: KeyboardHintsProps): JSX.Element {
  const hints = srs ? [...NAV_HINTS, ...SRS_GRADE_HINTS] : NAV_HINTS;

  return (
    <div className={styles.root} aria-hidden="true">
      {hints.map((hint, index) => (
        <span className={styles.item} key={hint.label}>
          {index > 0 && <span className={styles.sep}>·</span>}
          <kbd className={styles.key}>
            <span className={hint.key === '↑' ? styles.strong : styles.muted}>
              {hint.key}
            </span>
          </kbd>
          <span>{hint.label}</span>
        </span>
      ))}
    </div>
  );
}
