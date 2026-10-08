import type { CoachCapacityDrilldownState } from '@application/useCases/useCoachCapacityReport';
import type {
  DataTableColumn,
  DataTableRow,
} from '@interface/components/general/DataTable/DataTable';
import type { JSX } from 'react';
import { Button } from '@interface/components/general/Buttons';
import { DataTable } from '@interface/components/general/DataTable/DataTable';
import { EmptyState } from '@interface/components/general/EmptyState/EmptyState';
import { useId } from 'react';
import styles from './CoachCapacityDrilldown.module.scss';

const membershipColumns: DataTableColumn[] = [
  { id: 'student', header: 'Student' },
  { id: 'course', header: 'Course' },
  { id: 'startDate', header: 'Start Date' },
  { id: 'endDate', header: 'End Date' },
  { id: 'weeklyPrivateCalls', header: 'Weekly Private Calls', align: 'end' },
  { id: 'weeklyAdminTime', header: 'Weekly Admin Time (hrs)', align: 'end' },
];

function drilldownBody(
  coachName: string,
  rows: DataTableRow[],
  isLoading: boolean,
): JSX.Element {
  if (isLoading) {
    return (
      <p className={styles.message} role="status">
        Loading memberships...
      </p>
    );
  }
  if (rows.length === 0) {
    return (
      <EmptyState
        icon="user"
        title="No counted memberships"
        guidance={`None of ${coachName}'s memberships count toward their Coaching Hours in this report.`}
      />
    );
  }
  return (
    <DataTable
      caption={`Memberships counted for ${coachName}`}
      columns={membershipColumns}
      rows={rows}
      columnTemplate="minmax(10rem, 2fr) minmax(10rem, 2fr) 8rem 8rem 8rem 8rem"
      disableRowHover
    />
  );
}

export function CoachCapacityDrilldown({
  coachName,
  memberships,
  isLoading,
  close,
}: CoachCapacityDrilldownState): JSX.Element | null {
  const titleId = useId();

  if (coachName === null) {
    return null;
  }

  const rows: DataTableRow[] = memberships.map((membership) => ({
    id: membership.id,
    cells: [
      membership.student,
      membership.course,
      membership.startDate,
      membership.endDate,
      membership.weeklyPrivateCalls,
      membership.weeklyAdminTime,
    ],
  }));

  return (
    <section className={styles.drilldown} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          Memberships counted for {coachName}
        </h3>
        <Button variant="secondary" size="sm" onClick={close}>
          Close
        </Button>
      </div>
      {drilldownBody(coachName, rows, isLoading)}
    </section>
  );
}
