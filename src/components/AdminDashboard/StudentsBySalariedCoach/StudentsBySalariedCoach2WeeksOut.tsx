import type { CoachStudentData } from './types';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useStudentsBySalariedCoach2WeeksOut from 'src/hooks/AdminData/useStudentsBySalariedCoach2WeeksOut';

function renderRow(row: CoachStudentData, onClickFunc?: (str: string) => void) {
  return (
    <tr key={row.coachName}>
      <td
        onClick={() => {
          if (onClickFunc) {
            onClickFunc(`${row.coachName}_2 Weeks Out`);
          }
        }}
      >
        {row.coachName}
      </td>
      <td>{row.totalWeeklyPrivateCalls}</td>
    </tr>
  );
}

export default function StudentsBySalariedCoach2WeeksOut({
  setSelectedReport,
  isOpen,
  setIsOpen,
}: {
  setSelectedReport: (report: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { studentsBySalariedCoach2WeeksOutQuery } =
    useStudentsBySalariedCoach2WeeksOut();
  const headers = ['Coach Name', 'Total Weekly Private Calls'];

  return (
    <div>
      <SectionHeader
        title="Students by Salaried Coach - 2 Weeks Out"
        isOpen={isOpen}
        openFunction={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <DisplayOnlyTable
          headers={headers}
          data={studentsBySalariedCoach2WeeksOutQuery.data ?? []}
          renderRow={renderRow}
          onClickFunc={setSelectedReport}
        />
      )}
    </div>
  );
}
