import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useMembershipsBySalariedCoachCurrentReport from 'src/hooks/AdminData/useMembershipsBySalariedCoachCurrentReport';

function renderRow(
  row: MembershipsByCoach,
  onClickFunc?: (str: string) => void,
) {
  return (
    <tr key={row.coach.coach_id}>
      <td
        onClick={() => {
          if (onClickFunc) {
            onClickFunc(`${row.coach.coach_id}_Current Students`);
          }
        }}
      >
        {row.coach.fullName}
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
  const { membershipsBySalariedCoachCurrentReportQuery } =
    useMembershipsBySalariedCoachCurrentReport();
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
          data={membershipsBySalariedCoachCurrentReportQuery.data ?? []}
          renderRow={renderRow}
          onClickFunc={setSelectedReport}
        />
      )}
    </div>
  );
}
