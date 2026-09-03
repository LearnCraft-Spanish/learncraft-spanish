import type { VocabInfo } from '@application/units/useVocabInfo';
import type { Vocabulary } from '@learncraft-spanish/shared';
import type { JSX } from 'react';
import { IconButton } from '@interface/components/general/IconButton/IconButton';
import { WordPanel } from '@interface/components/textQuiz/WordPanel';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './WordPanelModal.module.scss';

interface WordPanelModalProps {
  vocabulary: Vocabulary;
  /** `useVocabInfo` in production — passed through to `WordPanel`. */
  vocabInfoHook: (vocab: Vocabulary) => VocabInfo;
  onClose: () => void;
}

/**
 * Mobile presentation of a selected vocabulary chip's details: the Deep Navy
 * `WordPanel` on a scrimmed dialog with a close button, portaled to `body`.
 * The portal is load-bearing — the quiz card clips to its radius
 * (`overflow: hidden`) and carries a swipe `transform`, either of which
 * would trap or misplace a `position: fixed` descendant.
 *
 * Rendered only below the desktop breakpoint; desktop keeps the panel
 * anchored under its chip in `WordChips`.
 */
export function WordPanelModal({
  vocabulary,
  vocabInfoHook,
  onClose,
}: WordPanelModalProps): JSX.Element {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);

    // The quiz behind the scrim should not scroll while the modal is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog so keyboard users are not stranded on the
    // (now inert) chip that opened it. Programmatic focus does not trigger
    // the `:focus-visible` ring.
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.scrim} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Details for ${vocabulary.word}`}
        className={styles.dialog}
        tabIndex={-1}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.closeRow}>
          <IconButton
            icon="x"
            label="Close word details"
            size="sm"
            tone="onDark"
            onClick={onClose}
          />
        </div>
        <WordPanel
          key={vocabulary.id}
          vocabulary={vocabulary}
          vocabInfoHook={vocabInfoHook}
        />
      </div>
    </div>,
    document.body,
  );
}
