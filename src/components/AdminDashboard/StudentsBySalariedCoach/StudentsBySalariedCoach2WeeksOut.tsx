import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useMembershipsBySalariedCoachTwoWeeksOutReport from 'src/hooks/AdminData/useMembershipsBySalariedCoachTwoWeeksOutReport';

function renderRow(
  row: MembershipsByCoach,
  onClickFunc?: (str: string) => void,
) {
  return (
    <tr key={row.coach.coach_id}>
      <td
        onClick={() => {
          if (onClickFunc) {
            onClickFunc(`${row.coach.coach_id}_2 Weeks Out`);
          }
        }}
      >
        {row.coach.fullName}
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
  const { membershipsBySalariedCoachTwoWeeksOutReportQuery } =
    useMembershipsBySalariedCoachTwoWeeksOutReport();
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
          data={membershipsBySalariedCoachTwoWeeksOutReportQuery.data ?? []}
          renderRow={renderRow}
          onClickFunc={setSelectedReport}
        />
      )}
    </div>
  );
}
