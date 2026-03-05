import { Loading } from '@interface/components/Loading';
import { DateRangeProvider } from '../Coaching/WeeksRecords/DateRangeProvider';
import IncompleteRecords from './components/IncompleteRecords';
import MyStudents from './components/MyStudents/MyStudents';
import MyStudentsBeyond150 from './components/MyStudentsBeyond150';
import RecentRecords from './components/RecentRecords';
import useCoachingDashboard from './useCoachingDashboard';
import './CoachingDashboard.scss';

function CoachingDashboard() {
  const { coach, states } = useCoachingDashboard();

  const isLoading = states.isLoading;
  const isError = states.isError;
  const dataReady = states.isSuccess;

  return (
    <div className="coachingDashbaord">
      {isLoading && <Loading message="Loading user data..." />}

      {isError && (
        <div className="coachingDashbaord__error">
          <h1>Error loading user data</h1>
        </div>
      )}
      {dataReady && (
        <>
          <div className="coachingDashbaord__header">
            <h1 className="coachingDashbaord__header__title">
              {`Welcome back, ${coach?.user.name}!`}
            </h1>
          </div>
          <div className="coachingDashbaordBody">
            {/* Records to Complete */}
            <IncompleteRecords />
            {/* Student Drill Down */}
            <MyStudents />
            {/* Recent Activity */}
            <div className="coachingDashbaord__recentActivity">
              <RecentRecords />
            </div>
            {coach && <MyStudentsBeyond150 coachId={coach.recordId} />}
          </div>
        </>
      )}
    </div>
  );
}

export default function CoachingDashboardWrapper() {
  return (
    <DateRangeProvider>
      <CoachingDashboard />
    </DateRangeProvider>
  );
}
