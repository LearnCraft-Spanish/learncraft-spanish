import type { Vocabulary } from '@learncraft-spanish/shared';
import type { JSX, ReactNode } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import styles from './WordChips.module.scss';

interface WordChipsProps {
  vocabulary: Vocabulary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** The `WordPanel` for `selectedId`, positioned under its chip. */
  panel?: ReactNode;
}

/**
 * The sentence's vocabulary as a row of chips. Also anchors `panel` under
 * the selected chip on desktop — the only component with the chip DOM nodes
 * needed to measure that position, per the local-positioning-hook carve-out
 * in `interface/DECISIONS.md`.
 */
export function WordChips({
  vocabulary,
  selectedId,
  onSelect,
  panel,
}: WordChipsProps): JSX.Element {
  const rowRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<number, HTMLButtonElement>());
  const [panelLeft, setPanelLeft] = useState(0);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const chip = selectedId !== null ? chipRefs.current.get(selectedId) : null;
    if (!row || !chip) {
      return;
    }
    // 700 mirrors WordPanel's own desktop width so the anchor clamps to the
    // row even before the panel itself has painted.
    const panelWidth = 700;
    const maxLeft = Math.max(0, row.clientWidth - panelWidth);
    setPanelLeft(Math.min(chip.offsetLeft, maxLeft));
  }, [selectedId]);

  return (
    <div className={styles.root}>
      <div className={styles.row} ref={rowRef}>
        {vocabulary.map((vocab) => {
          const selected = selectedId === vocab.id;
          return (
            <button
              key={vocab.id}
              ref={(node) => {
                if (node) {
                  chipRefs.current.set(vocab.id, node);
                } else {
                  chipRefs.current.delete(vocab.id);
                }
              }}
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
        <div className={styles.panelSlot} style={{ left: `${panelLeft}px` }}>
          {panel}
        </div>
      )}
    </div>
  );
}
