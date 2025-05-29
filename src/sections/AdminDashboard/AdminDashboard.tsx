import {
  ActiveMemberships,
  AssignmentsCompletedByWeek,
  CallsByCoach,
  DropoutsByLevel,
  RecentLesson200Students,
  WeeklySummaries,
} from 'src/components/AdminDashboard';
import { Loading } from 'src/components/Loading';
import useAdminDashboard from './useAdminDashboard';
import './AdminDashboard.scss';

export default function AdminDashboard() {
  const { isLoading, isError, isSuccess } = useAdminDashboard();

  return (
    <div className="admin-dashboard">
      {isLoading && <Loading message={'Loading Admin Dashboard...'} />}
      {isError && <div>Error</div>}
      {isSuccess && (
        <>
          <h2>Admin Dashboard</h2>
          <WeeklySummaries />
          <CallsByCoach />
          <div className="admin-dashboard-grid">
            <ActiveMemberships />
            <DropoutsByLevel />
            <AssignmentsCompletedByWeek />
            <RecentLesson200Students />
          </div>
        </>
      )}
    </div>
  );
}
