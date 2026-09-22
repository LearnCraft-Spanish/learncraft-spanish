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
  onCollect?: () => void;
  /** Bulk action label. The manager sends selected cards the other way. */
  primaryActionLabel?: string;
}

function selectionLabel(count: number): string {
  return count === 1 ? '1 flashcard selected' : `${count} flashcards selected`;
}

function dismissNoop(): void {}

/**
 * Finder notices + bulk-collect bar. One full-bleed Deep Navy slab: notice
 * on top, hairline, selection under it. The page owns the notice slot, the
 * selection count, and the collect/clear work.
 *
 * The `role="status"` element is never unmounted. A live region that is
 * inserted already holding its text is not reliably announced by NVDA, JAWS,
 * or VoiceOver, and for a removal that confirmation is the only signal the
 * student gets. Empty, it is an unstyled div with no children: no height, no
 * navy, and no `.slab`, so the docked bar still appears only when there is
 * something to show.
 */
export function FinderBottomBar({
  notice = null,
  onDismissNotice = dismissNoop,
  selectedCount = 0,
  onClearSelection,
  onCollect,
  primaryActionLabel = 'Collect flashcards',
}: FinderBottomBarProps): JSX.Element {
  const showNotice = Boolean(notice);
  const showSelection = selectedCount > 0;
  const docked = showNotice || showSelection;

  return (
    <div className={docked ? styles.slab : undefined}>
      <div role="status">
        {showNotice ? (
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
        ) : null}
      </div>
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
              <span className={styles.collect}>
                <Button variant="primary" tone="onDark" onClick={onCollect}>
                  {primaryActionLabel}
                </Button>
              </span>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
