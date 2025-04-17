import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useAssignmentsCompletedByWeek from 'src/hooks/AdminData/useAssignmentsCompletedByWeek';

function renderRow(row: any) {
  return (
    <tr>
      <td>{row.Level}</td>
      <td>{row['Assignments Completed (avg)']}</td>
    </tr>
  );
}
export default function AssignmentsCompletedByWeek() {
  const { assignmentsCompletedByWeekQuery } = useAssignmentsCompletedByWeek();

  const [isOpen, setIsOpen] = useState(false);
  const headers = ['Level', 'Assignments Completed (avg)'];

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
