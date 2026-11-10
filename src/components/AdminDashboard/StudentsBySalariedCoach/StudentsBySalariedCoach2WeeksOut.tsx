import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import CoachHoursTotalRow from 'src/components/AdminDashboard/CoachHoursTotalRow';
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
  const reportData =
    membershipsBySalariedCoachTwoWeeksOutReportQuery.data ?? [];

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
          data={reportData}
          renderRow={renderRow}
          onClickFunc={setSelectedReport}
          footerRow={
            reportData.length > 0 ? (
              <CoachHoursTotalRow data={reportData} />
            ) : undefined
          }
        />
      )}
    </div>
  );
}
