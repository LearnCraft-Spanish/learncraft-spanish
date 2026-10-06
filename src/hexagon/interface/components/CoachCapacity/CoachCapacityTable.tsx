import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import type {
  CellRenderProps,
  ColumnDisplayConfig,
} from '@interface/components/EditableTable/types';
import type { JSX } from 'react';
import { EditableTable } from '@interface/components/EditableTable';
import styles from './CoachCapacityTable.module.scss';

export interface CoachCapacityTableProps {
  rows: TableRow[];
  columns: ColumnDefinition[];
  isLoading: boolean;
  isError: boolean;
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
  },
  { id: 'bookedPercent', label: 'Booked %', width: '6rem', pinned: 'right' },
  { id: 'notes', label: 'Notes', width: '18rem' },
];

const textColumnIds = new Set(['coach', 'notes']);

const noDirtyRows = new Set<string>();
const noValidationErrors: Record<string, Record<string, string>> = {};
function ignoreCellChange(): void {}

function renderCoachCapacityCell({ column, value }: CellRenderProps) {
  return (
    <div
      className={
        textColumnIds.has(column.id) ? styles.textCell : styles.numberCell
      }
    >
      {value}
    </div>
  );
}

export function CoachCapacityTable({
  rows,
  columns,
  isLoading,
  isError,
}: CoachCapacityTableProps): JSX.Element {
  if (isError) {
    return (
      <p className={styles.message} role="alert">
        Coach Capacity could not be loaded.
      </p>
    );
  }

  if (!isLoading && rows.length === 0) {
    return <p className={styles.message}>No coaches found</p>;
  }

  return (
    <EditableTable
      rows={rows}
      columns={columns}
      displayConfig={coachCapacityDisplayConfig}
      renderCell={renderCoachCapacityCell}
      dirtyRowIds={noDirtyRows}
      validationErrors={noValidationErrors}
      onCellChange={ignoreCellChange}
      isLoading={isLoading}
      isSaving={false}
      isValid
    />
  );
}
