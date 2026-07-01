import type { ActiveMembershipSummary } from '@learncraft-spanish/shared';
import { InlineLoading } from '@interface/components/Loading';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import useMembershipsByCoachTwoWeeksOutReport from 'src/hooks/AdminData/useMembershipsByCoachTwoWeeksOutReport';
import 'src/components/Table/Table.scss';

function formatDate(date: string): string {
  return date ? new Date(date).toLocaleDateString() : '';
}

function renderRow(row: ActiveMembershipSummary) {
  return (
    <tr key={`${row.studentName}-${row.courseName}`}>
      <td>{row.studentName}</td>
      <td>{row.courseName}</td>
      <td>{row.courseWeeklyPrivateCalls}</td>
      <td>{formatDate(row.startDate)}</td>
      <td>{formatDate(row.endDate)}</td>
    </tr>
  );
}

export default function MembershipsByCoachTwoWeeksOutReportDrilldownTable({
  selectedReport,
}: {
  selectedReport: string;
}) {
  const coachId = Number(selectedReport.split('_')[0]);

  if (!coachId) {
    throw new Error('Coach id not found');
  }

  const { membershipsByCoachTwoWeeksOutReportQuery } =
    useMembershipsByCoachTwoWeeksOutReport();

  const { data, isLoading, isError, isSuccess } =
    membershipsByCoachTwoWeeksOutReportQuery;

  const coachData = data?.find((coach) => coach.coach.coach_id === coachId);
  const memberships = coachData?.memberships ?? [];

  return (
    <div className="table-wrapper body-container">
      {isLoading && <InlineLoading />}
      {isError && <div>Error</div>}
      {isSuccess && memberships && (
        <DisplayOnlyTable
          headers={[
            'Student',
            'Course Name',
            'Weekly Private Calls',
            'Start Date',
            'End Date',
          ]}
          data={memberships}
          renderRow={renderRow}
        />
      )}
    </div>
  );
}
