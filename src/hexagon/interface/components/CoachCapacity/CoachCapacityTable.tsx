import type {
  CoachCapacityDrilldownState,
  CoachCapacityNotesPanelState,
} from '@application/useCases/useCoachCapacityReport';
import type {
  CellRenderProps,
  ColumnDisplayConfig,
  EditableTableUseCaseProps,
} from '@interface/components/EditableTable/types';
import type { FocusEvent, JSX, ReactNode } from 'react';
import { NOT_SET_DISPLAY } from '@domain/functions/coachCapacity';
import { CoachCapacityDrilldown } from '@interface/components/CoachCapacity/CoachCapacityDrilldown';
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
  /** Called when the admin leaves a settings cell or presses Enter in it */
  onCommitCell: (rowId: string, columnId: string) => void;
  onTableFocus: () => void;
  /** Called once focus has left the table, not when it moves within it */
  onTableBlur: () => void;
  onOpenNotes: (rowId: string) => void;
  notesPanel: CoachCapacityNotesPanelState;
  onOpenDrilldown: (rowId: string) => void;
  drilldown: CoachCapacityDrilldownState;
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
    sortable: true,
  },
  {
    id: 'desiredHours',
    label: 'Desired Hours',
    width: '7rem',
    pinned: 'right',
    placeholder: NOT_SET_DISPLAY,
  },
  {
    id: 'bookedPercent',
    label: 'Booked %',
    width: '6rem',
    pinned: 'right',
    sortable: true,
  },
  { id: 'notes', label: 'Notes', width: '18rem' },
];

export function CoachCapacityTable({
  tableProps,
  isError,
  saveError,
  onCommitCell,
  onTableFocus,
  onTableBlur,
  onOpenNotes,
  notesPanel,
  onOpenDrilldown,
  drilldown,
}: CoachCapacityTableProps): JSX.Element {
  const renderCell = useCallback(
    (props: CellRenderProps): ReactNode => {
      const { column, row, value, isEditable } = props;
      if (column.id === 'coach') {
        return (
          <button
            type="button"
            className={`${styles.readOnlyCell} ${styles.textCell} ${styles.coachButton}`}
            onClick={() => onOpenDrilldown(row.id)}
          >
            {value}
          </button>
        );
      }
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
          <div
            className={styles.inputCell}
            onBlur={() => onCommitCell(row.id, column.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onCommitCell(row.id, column.id);
            }}
          >
            <StandardCell {...props} />
          </div>
        );
      }
      return (
        <div className={`${styles.readOnlyCell} ${styles.numberCell}`}>
          {value}
        </div>
      );
    },
    [onCommitCell, onOpenNotes, onOpenDrilldown],
  );

  const handleTableBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) onTableBlur();
    },
    [onTableBlur],
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
      <div onFocus={onTableFocus} onBlur={handleTableBlur}>
        <EditableTable
          {...tableProps}
          displayConfig={coachCapacityDisplayConfig}
          renderCell={renderCell}
        />
      </div>
      <CoachCapacityDrilldown {...drilldown} />
      <CoachCapacityNotesPanel {...notesPanel} />
    </>
  );
}
