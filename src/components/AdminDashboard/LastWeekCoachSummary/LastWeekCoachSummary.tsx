import type { CoachSummaryData } from '../WeekCoachSummary/types';
import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useLastWeekCoachSummary from 'src/hooks/AdminData/useLastWeekCoachSummary';
function renderRow(row: CoachSummaryData) {
  return (
    <tr>
      <td>{row.primaryCoach}</td>
      <td>{row.recordsCompleteRefAvg}</td>
      <td>{row.recordIdDistinctCount}</td>
    </tr>
  );
}

export default function LastWeekCoachSummary() {
  const { lastWeekCoachSummaryQuery } = useLastWeekCoachSummary();

  const [isOpen, setIsOpen] = useState(false);
  const headers = ['Coach', 'Records Complete (percent)', 'Number of Records'];

  return (
    <div>
      <SectionHeader
        title="Last Week Coach Summary"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={lastWeekCoachSummaryQuery.data ?? []}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
