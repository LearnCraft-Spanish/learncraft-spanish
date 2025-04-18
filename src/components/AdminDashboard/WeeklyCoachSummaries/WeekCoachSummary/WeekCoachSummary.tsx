import type { CoachSummaryData } from './types';
import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useWeeklyCoachSummary from 'src/hooks/AdminData/useWeeklyCoachSummary';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
function renderRow(row: CoachSummaryData) {
  const { openContextual } = useContextualMenu();
  return (
    <tr>
      <td
        onClick={() => {
          openContextual(
            `week-drilldown_${row.primaryCoach}_Weekly Coach Summary`,
          );
        }}
      >
        {row.primaryCoach}
      </td>
      <td>{row.recordsCompleteRefAvg}</td>
      <td>{row.recordIdDistinctCount}</td>
    </tr>
  );
}

export default function WeekCoachSummary() {
  const { weeklyCoachSummaryQuery } = useWeeklyCoachSummary();

  const [isOpen, setIsOpen] = useState(false);
  const headers = ['Coach', 'Records Complete (percent)', 'Number of Records'];

  return (
    <div>
      <SectionHeader
        title="Week Coach Summary"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={weeklyCoachSummaryQuery.data ?? []}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
