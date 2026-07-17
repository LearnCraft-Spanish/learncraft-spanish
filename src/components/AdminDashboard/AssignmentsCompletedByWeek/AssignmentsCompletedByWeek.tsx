import type { AssignmentsCompletedByWeek as AssignmentsCompletedByWeekRow } from '@learncraft-spanish/shared';
import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useAssignmentsCompletedByWeek from 'src/hooks/AdminData/useAssignmentsCompletedByWeek';

function renderRow(row: AssignmentsCompletedByWeekRow) {
  return (
    <tr key={row.courseName}>
      <td>{row.courseName}</td>
      <td>{row.assignmentsCompleted}</td>
    </tr>
  );
}

export default function AssignmentsCompletedByWeek() {
  const { assignmentsCompletedByWeekQuery } = useAssignmentsCompletedByWeek();

  const [isOpen, setIsOpen] = useState(false);
  const headers = ['Course Name', 'Assignments Completed'];

  return (
    <div>
      <SectionHeader
        title="Assignments Completed By Week"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={assignmentsCompletedByWeekQuery.data ?? []}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
