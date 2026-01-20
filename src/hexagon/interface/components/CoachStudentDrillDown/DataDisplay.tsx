import type { CoachCallCount } from '@learncraft-spanish/shared';
import { useAllCoachesByStudent } from '@application/queries/CoachQueries/useAllCoachesByStudent';
import InlineLoading from '@interface/components/Loading/InlineLoading';
import './CoachStudentDrillDown.scss';
export default function DataDisplay({ studentId }: { studentId: number }) {
  const { data, isLoading, error } = useAllCoachesByStudent(studentId);
  if (isLoading) {
    return <InlineLoading message="Loading coach data..." />;
  }
  if (error) {
    return <p>Error: {error?.message}</p>;
  }
  if (data && data.length > 0) {
    return (
      <div className="coachStudentDrillDown">
        {data.map((coach: CoachCallCount) => (
          <div key={coach.coach.id} className="coach-item-container">
            <p>
              <span className="coach-drilldown-label">Coach: </span>
              {coach.coach.fullName}
            </p>
            <p>
              <span className="coach-drilldown-label">Private Calls: </span>
              {coach.privateCalls}
            </p>
            <p>
              <span className="coach-drilldown-label">Group Calls: </span>
              {coach.groupCalls}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return <div>No previous coach data found</div>;
}
