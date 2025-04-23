import {
  ActiveMemberships,
  AssignmentsCompletedByWeek,
  CallsByCoach,
  DropoutsByLevel,
  WeeklySummaries,
} from 'src/components/AdminDashboard';
import './AdminDashboard.scss';

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <WeeklySummaries />
      <CallsByCoach />
      <div className="admin-dashboard-grid">
        <ActiveMemberships />
        <DropoutsByLevel />
        <AssignmentsCompletedByWeek />
      </div>
    </div>
  );
}
