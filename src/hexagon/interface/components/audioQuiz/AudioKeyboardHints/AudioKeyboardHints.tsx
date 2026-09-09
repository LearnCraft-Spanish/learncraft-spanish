import type { JSX } from 'react';
import styles from './AudioKeyboardHints.module.scss';

interface HintItem {
  keys: string[];
  label: string;
}

const HINTS: HintItem[] = [
  { keys: ['space'], label: 'play / pause' },
  { keys: ['↑'], label: 'next step' },
  { keys: ['←', '→'], label: 'card' },
];

/**
 * Desktop-only legend for the shortcuts `AudioQuizV2` wires up globally:
 * `space` play/pause · `↑` next step · `←` `→` card. A separate component
 * from text quiz's `KeyboardHints` — the labels and the shortcuts they
 * describe are different (no SRS hard/easy, no flip), so sharing one
 * component would mean branching its content on quiz kind rather than on
 * quiz state, which belongs in two files, not one `if`.
 */
export function AudioKeyboardHints(): JSX.Element {
  return (
    <div className={styles.root} aria-hidden="true">
      {HINTS.map((hint, index) => (
        <span className={styles.item} key={hint.label}>
          {index > 0 && <span className={styles.sep}>·</span>}
          {hint.keys.map((key) => (
            <kbd className={styles.key} key={key}>
              {key}
            </kbd>
          ))}
          <span>{hint.label}</span>
        </span>
      ))}
    </div>
  );
}
