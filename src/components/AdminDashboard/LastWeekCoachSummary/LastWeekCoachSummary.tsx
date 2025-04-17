import { useState } from 'react';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useLastWeekCoachSummary from 'src/hooks/AdminData/useLastWeekCoachSummary';
function renderRow(row: any) {
  return (
    <tr>
      <td>{row['Primary Coach']}</td>
      <td>{row['Records Complete Ref (avg)']}</td>
      <td>{row['Record ID# (distinct count)']}</td>
    </tr>
  );
}

export default function LastWeekCoachSummary() {
  const { lastWeekCoachSummaryQuery } = useLastWeekCoachSummary();

  const [isOpen, setIsOpen] = useState(false);
  const headers = [
    'Primary Coach',
    'Records Complete Ref (avg)',
    'Record ID# (distinct count)',
  ];

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
