import type { Membership } from './types';
import { InlineLoading } from '@interface/components/Loading';
import DisplayOnlyTable from 'src/components/CoachingDashboard/components/RecentRecords/DisplayOnlyTable';
import useStudentsBySalariedCoach2WeeksOut from 'src/hooks/AdminData/useStudentsBySalariedCoach2WeeksOut';
import 'src/components/Table/Table.scss';

function renderRow(row: Membership) {
  return (
    <tr key={`${row.student}-${row.courseName}`}>
      <td>{row.student}</td>
      <td>{row.courseName}</td>
      <td>{row.courseWeeklyPrivateCalls}</td>
      <td>
        {typeof row.startDate === 'string'
          ? row.startDate
          : row.startDate
            ? new Date(row.startDate).toLocaleDateString()
            : ''}
      </td>
      <td>
        {row.endDate
          ? typeof row.endDate === 'string'
            ? row.endDate
            : new Date(row.endDate).toLocaleDateString()
          : ''}
      </td>
    </tr>
  );
}

export default function TwoWeeksOutDrilldownTable({
  selectedReport,
}: {
  selectedReport: string;
}) {
  const coachName = selectedReport.split('_')[0];

  if (!coachName) {
    throw new Error('Coach name not found');
  }

  const { studentsBySalariedCoach2WeeksOutQuery } =
    useStudentsBySalariedCoach2WeeksOut();

  const { data, isLoading, isError, isSuccess } =
    studentsBySalariedCoach2WeeksOutQuery;

  // Find the coach's data and get their memberships
  const coachData = data?.find((coach) => coach.coachName === coachName);
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
