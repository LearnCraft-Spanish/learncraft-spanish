import type { Vocabulary } from '@learncraft-spanish/shared';
import type { JSX, ReactNode } from 'react';
import styles from './WordChips.module.scss';

interface WordChipsProps {
  vocabulary: Vocabulary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** The `WordPanel` for `selectedId`, centered under the chip row. */
  panel?: ReactNode;
}

/**
 * The sentence's vocabulary as a row of chips. Also renders `panel` centered
 * under the row on desktop — mobile never passes one, it opens
 * `WordPanelModal` instead (see `TextQuizV2`).
 */
export function WordChips({
  vocabulary,
  selectedId,
  onSelect,
  panel,
}: WordChipsProps): JSX.Element {
  return (
    <div className={styles.root}>
      <div className={styles.row}>
        {vocabulary.map((vocab) => {
          const selected = selectedId === vocab.id;
          return (
            <button
              key={vocab.id}
              type="button"
              className={
                selected ? `${styles.chip} ${styles.selected}` : styles.chip
              }
              aria-pressed={selected}
              onClick={() => onSelect(vocab.id)}
            >
              {vocab.word}
            </button>
          );
        })}
      </div>

      {selectedId !== null && panel !== undefined && (
        <div className={styles.panelSlot}>{panel}</div>
      )}
    </div>
  );
}
