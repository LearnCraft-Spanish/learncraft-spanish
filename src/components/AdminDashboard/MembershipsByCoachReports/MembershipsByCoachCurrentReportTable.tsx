import type { MembershipsByCoach } from '@learncraft-spanish/shared';
import CoachHoursTotalRow from 'src/components/AdminDashboard/CoachHoursTotalRow';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import SectionHeader from 'src/components/CoachingDashboard/components/SectionHeader';
import useMembershipsByCoachCurrentReport from 'src/hooks/AdminData/useMembershipsByCoachCurrentReport';

function renderRow(
  row: MembershipsByCoach,
  onClickFunc?: (str: string) => void,
) {
  return (
    <tr key={row.coach.coach_id}>
      <td
        onClick={() => {
          if (onClickFunc) {
            onClickFunc(`${row.coach.coach_id}_Current`);
          }
        }}
      >
        {row.coach.fullName}
      </td>
      <td>{row.totalWeeklyPrivateCalls}</td>
    </tr>
  );
}

export default function MembershipsByCoachCurrentReportTable({
  setSelectedReport,
  isOpen,
  setIsOpen,
}: {
  setSelectedReport: (report: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { membershipsByCoachCurrentReportQuery } =
    useMembershipsByCoachCurrentReport();
  const headers = ['Coach Name', 'Total Weekly Private Calls'];
  const reportData = membershipsByCoachCurrentReportQuery.data ?? [];

  return (
    <div>
      <SectionHeader
        title="Active Memberships by Coach, Current"
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
