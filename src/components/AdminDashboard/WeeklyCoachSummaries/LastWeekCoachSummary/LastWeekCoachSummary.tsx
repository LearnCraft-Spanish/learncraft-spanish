import type { CoachSummaryData } from '../WeekCoachSummary/types';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useLastWeekCoachSummary from 'src/hooks/AdminData/useLastWeekCoachSummary';
function renderRow(row: CoachSummaryData, onClickFunc?: (str: string) => void) {
  return (
    <tr key={row.primaryCoach}>
      <td
        onClick={() => {
          if (onClickFunc) {
            onClickFunc(`${row.primaryCoach}_Last Week Coach Summary`);
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

export default function LastWeekCoachSummary({
  setSelectedReport,
  isOpen,
  setIsOpen,
}: {
  setSelectedReport: (report: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { lastWeekCoachSummaryQuery } = useLastWeekCoachSummary();

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
          onClickFunc={setSelectedReport}
        />
      )}
    </div>
  );
}
