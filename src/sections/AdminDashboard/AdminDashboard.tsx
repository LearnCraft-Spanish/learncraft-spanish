import {
  ActiveMemberships,
  AssignmentsCompletedByWeek,
  DropoutsByLevel,
  WeekCoachSummary,
} from 'src/components/AdminDashboard';
import './AdminDashboard.scss';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <ActiveMemberships />
      <AssignmentsCompletedByWeek />
      <DropoutsByLevel />
      <WeekCoachSummary />
    </div>
  );
}
