import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons/Button/Button';
import styles from './FinderBottomBar.module.scss';

export interface FinderBottomBarProps {
  /** Confirmation copy. Null or empty hides the notice layer. */
  notice?: string | null;
  onDismissNotice?: () => void;
  /** Checked rows. Zero hides the selection layer. */
  selectedCount?: number;
  onClearSelection?: () => void;
  onAddToSet?: () => void;
  /**
   * Accepted so the current page slot compiles. Unused — pass notice and
   * selection instead of the flashcards query.
   */
  flashcardsQuery?: unknown;
}

function selectionLabel(count: number): string {
  return count === 1 ? '1 flashcard selected' : `${count} flashcards selected`;
}

function dismissNoop(): void {}

/**
 * Finder notices + bulk-add bar. One full-bleed Deep Navy slab: notice on
 * top, hairline, selection under it. The page owns the notice slot, the
 * selection count, and the add/clear work.
 */
export function FinderBottomBar({
  notice = null,
  onDismissNotice = dismissNoop,
  selectedCount = 0,
  onClearSelection,
  onAddToSet,
}: FinderBottomBarProps): JSX.Element | null {
  const showNotice = Boolean(notice);
  const showSelection = selectedCount > 0;

  if (!showNotice && !showSelection) {
    return null;
  }

  return (
    <div className={styles.slab}>
      {notice ? (
        <div role="status">
          <div className={styles.row}>
            <span className={styles.message}>{notice}</span>
            <span className={styles.dismiss}>
              <Button
                variant="ghost"
                size="inline"
                tone="onDark"
                onClick={onDismissNotice}
              >
                Dismiss
              </Button>
            </span>
          </div>
        </div>
      ) : null}
      {showSelection ? (
        <div className={styles.selection}>
          <div className={styles.row}>
            <span className={styles.label}>
              {selectionLabel(selectedCount)}
            </span>
            <span className={styles.actions}>
              <span className={styles.clear}>
                <Button
                  variant="ghost"
                  size="inline"
                  tone="onDark"
                  onClick={onClearSelection}
                >
                  Clear selection
                </Button>
              </span>
              <span className={styles.add}>
                <Button variant="primary" tone="onDark" onClick={onAddToSet}>
                  Add to working set
                </Button>
              </span>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
