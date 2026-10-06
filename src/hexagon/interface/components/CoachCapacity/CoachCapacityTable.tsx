import type { CoachCapacityNotesPanelState } from '@application/useCases/useCoachCapacityTodayReport';
import type {
  CellRenderProps,
  ColumnDisplayConfig,
  EditableTableUseCaseProps,
} from '@interface/components/EditableTable/types';
import type { JSX, ReactNode } from 'react';
import { NOT_SET_DISPLAY } from '@domain/functions/coachCapacity';
import { CoachCapacityNotesPanel } from '@interface/components/CoachCapacity/CoachCapacityNotesPanel';
import {
  EditableTable,
  StandardCell,
} from '@interface/components/EditableTable';
import { useCallback } from 'react';
import styles from './CoachCapacityTable.module.scss';

export interface CoachCapacityTableProps {
  tableProps: EditableTableUseCaseProps;
  isError: boolean;
  saveError: string | null;
  onOpenNotes: (rowId: string) => void;
  notesPanel: CoachCapacityNotesPanelState;
}

const coachCapacityDisplayConfig: ColumnDisplayConfig[] = [
  { id: 'coach', label: 'Coach', width: '11rem', pinned: 'left' },
  { id: 'coachingHours', label: 'Coaching Hours', width: '7rem' },
  { id: 'groupSessionsPerWeek', label: 'Group Sessions', width: '7rem' },
  { id: 'projectsHours', label: 'Projects', width: '7rem' },
  { id: 'internalTimeHours', label: 'Internal Time', width: '7rem' },
  { id: 'teamMeetingHours', label: 'Team Meeting', width: '7rem' },
  {
    id: 'committedHours',
    label: 'Committed Hours',
    width: '7rem',
    pinned: 'right',
  },
  {
    id: 'desiredHours',
    label: 'Desired Hours',
    width: '7rem',
    pinned: 'right',
    placeholder: NOT_SET_DISPLAY,
  },
  { id: 'bookedPercent', label: 'Booked %', width: '6rem', pinned: 'right' },
  { id: 'notes', label: 'Notes', width: '18rem' },
];

export function CoachCapacityTable({
  tableProps,
  isError,
  saveError,
  onOpenNotes,
  notesPanel,
}: CoachCapacityTableProps): JSX.Element {
  const renderCell = useCallback(
    (props: CellRenderProps): ReactNode => {
      const { column, row, value, isEditable } = props;
      if (column.id === 'notes') {
        return (
          <button
            type="button"
            className={styles.notesButton}
            onClick={() => onOpenNotes(row.id)}
          >
            {value || (
              <span className={styles.notesPlaceholder}>Add notes</span>
            )}
          </button>
        );
      }
      if (isEditable) {
        return (
          <div className={styles.inputCell}>
            <StandardCell {...props} />
          </div>
        );
      }
      return (
        <div
          className={`${styles.readOnlyCell} ${
            column.id === 'coach' ? styles.textCell : styles.numberCell
          }`}
        >
          {value}
        </div>
      );
    },
    [onOpenNotes],
  );

  if (isError) {
    return (
      <p className={styles.message} role="alert">
        Coach Capacity could not be loaded.
      </p>
    );
  }

  if (!tableProps.isLoading && tableProps.rows.length === 0) {
    return <p className={styles.message}>No coaches found</p>;
  }

  return (
    <>
      {saveError && (
        <p className={styles.saveError} role="alert">
          {saveError}
        </p>
      )}
      <EditableTable
        {...tableProps}
        displayConfig={coachCapacityDisplayConfig}
        renderCell={renderCell}
      />
      <CoachCapacityNotesPanel {...notesPanel} />
    </>
  );
}
