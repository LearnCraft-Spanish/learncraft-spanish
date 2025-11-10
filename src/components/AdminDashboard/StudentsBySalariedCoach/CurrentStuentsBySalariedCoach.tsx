import type { CoachStudentData } from './types';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useCurrentStudentsBySalariedCoach from 'src/hooks/AdminData/useCurrentStudentsBySalariedCoach';

function renderRow(row: CoachStudentData, onClickFunc?: (str: string) => void) {
  return (
    <tr key={row.coachName}>
      <td
        onClick={() => {
          if (onClickFunc) {
            onClickFunc(`${row.coachName}_Current Students`);
          }
        }}
      >
        {row.coachName}
      </td>
      <td>{row.totalWeeklyPrivateCalls}</td>
    </tr>
  );
}

export default function CurrentStudentsBySalariedCoach({
  setSelectedReport,
  isOpen,
  setIsOpen,
}: {
  setSelectedReport: (report: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { currentStudentsBySalariedCoachQuery } =
    useCurrentStudentsBySalariedCoach();
  const headers = ['Coach Name', 'Total Weekly Private Calls'];

  return (
    <div>
      <SectionHeader
        title="Current Students by Salaried Coach"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={currentStudentsBySalariedCoachQuery.data ?? []}
          renderRow={renderRow}
          onClickFunc={setSelectedReport}
        />
      )}
    </div>
  );
}
