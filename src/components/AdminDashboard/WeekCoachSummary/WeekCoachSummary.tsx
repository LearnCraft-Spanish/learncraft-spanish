import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useWeeklyCoachSummary from 'src/hooks/AdminData/useWeeklyCoachSummary';
function renderRow(row: any) {
  return (
    <tr>
      <td>{row['Primary Coach']}</td>
      <td>{row['Records Complete Ref (avg)']}</td>
      <td>{row['Record ID# (distinct count)']}</td>
    </tr>
  );
}

export default function WeekCoachSummary() {
  const { weeklyCoachSummaryQuery } = useWeeklyCoachSummary();

  const [isOpen, setIsOpen] = useState(false);
  const headers = [
    'Primary Coach',
    'Records Complete Ref (avg)',
    'Record ID# (distinct count)',
  ];

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
