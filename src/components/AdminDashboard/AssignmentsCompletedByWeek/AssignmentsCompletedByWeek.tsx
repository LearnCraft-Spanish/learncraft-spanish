import type { AssignmentsCompletedByWeek as AssignmentsCompletedByWeekRow } from '@learncraft-spanish/shared';
import { LOAD_MORE_SENTINEL } from '@application/units/useAssignmentsCompletedByWeekReport/useAssignmentsCompletedByWeekReport';
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
  const {
    assignmentsCompletedByWeekQuery,
    weekStarts,
    weekOptions,
    selectWeekStarts,
  } = useAssignmentsCompletedByWeek();

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
        <>
          <div className="weekSelector">
            <label htmlFor="assignmentsCompletedByWeekFilter">Week:</label>
            <select
              id="assignmentsCompletedByWeekFilter"
              onChange={(e) => selectWeekStarts(e.target.value)}
              value={weekStarts}
            >
              {weekOptions.map((option) => (
                <option key={option.weekStarts} value={option.weekStarts}>
                  {option.label}
                </option>
              ))}
              <option value={LOAD_MORE_SENTINEL} className="loadMoreOption">
                Load More Dates...
              </option>
            </select>
          </div>
          <DisplayOnlyTable
            headers={headers}
            data={assignmentsCompletedByWeekQuery.data ?? []}
            renderRow={renderRow}
          />
        </>
      )}
    </div>
  );
}
