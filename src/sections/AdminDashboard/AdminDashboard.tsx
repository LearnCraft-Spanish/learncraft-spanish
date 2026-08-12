import { Loading } from '@interface/components/Loading';
import {
  ActiveMemberships,
  AssignmentsCompletedByWeek,
  CallsByCoach,
  DropoutsByLevel,
  LeadsToReEngage,
  MembershipsByCoachReports,
  StudentsBySalariedCoach,
  WeeklySummaries,
  WeeklyTimeCommitmentByCoach,
} from 'src/components/AdminDashboard';
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
          <StudentsBySalariedCoach />
          <MembershipsByCoachReports />
          <WeeklyTimeCommitmentByCoach />
          <LeadsToReEngage />
          <div className="admin-dashboard-grid">
            <ActiveMemberships />
            <DropoutsByLevel />
            <AssignmentsCompletedByWeek />
          </div>
        </>
      )}
    </div>
  );
}
