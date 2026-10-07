import type { CoachCapacityNotesPanelState } from '@application/useCases/useCoachCapacityReport';
import type { JSX, KeyboardEvent } from 'react';
import { Button } from '@interface/components/general/Buttons';
import { useId } from 'react';
import styles from './CoachCapacityNotesPanel.module.scss';

export function CoachCapacityNotesPanel({
  coachName,
  draft,
  setDraft,
  close,
  save,
  isSaving,
  error,
}: CoachCapacityNotesPanelState): JSX.Element | null {
  const titleId = useId();

  if (coachName === null) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.key === 'Escape' && !isSaving) {
      close();
    }
  }

  return (
    <aside
      className={styles.panel}
      role="dialog"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
    >
      <h3 id={titleId} className={styles.title}>
        Notes: {coachName}
      </h3>
      <textarea
        className={styles.notes}
        aria-label={`Notes for ${coachName}`}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        disabled={isSaving}
        autoFocus
      />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          onClick={close}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button size="sm" onClick={() => void save()} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save notes'}
        </Button>
      </div>
    </aside>
  );
}
