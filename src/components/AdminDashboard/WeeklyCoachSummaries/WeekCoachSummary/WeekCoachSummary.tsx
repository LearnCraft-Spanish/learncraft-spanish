import type { ReactNode } from 'react';
import type { CoachSummaryData } from './types';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useWeeklyCoachSummary from 'src/hooks/AdminData/useWeeklyCoachSummary';
function renderRow(
  row: CoachSummaryData,
  onClickFunc?: (str: string) => void,
): ReactNode {
  return (
    <tr key={row.primaryCoach}>
      <td
        onClick={() => {
          if (onClickFunc) {
            onClickFunc(`${row.primaryCoach}_Weekly Coach Summary`);
          }
        }}
      >
        {row.primaryCoach}
      </td>
      <td>{row.recordsCompleteRefAvg}</td>
      <td>{row.recordIdDistinctCount}</td>
    </tr>
  );
}

export default function WeekCoachSummary({
  setSelectedReport,
  isOpen,
  setIsOpen,
}: {
  setSelectedReport: (report: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { weeklyCoachSummaryQuery } = useWeeklyCoachSummary();

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
          onClickFunc={setSelectedReport}
        />
      )}
    </div>
  );
}
