import { Loading } from '@interface/components/Loading';
// import { DateRangeProvider } from '../Coaching/WeeksRecords/DateRangeProvider';
// import IncompleteRecords from './components/IncompleteRecords';
// import MyStudents from './components/MyStudents/MyStudents';
// import MyStudentsBeyond150 from './components/MyStudentsBeyond150';
import RecentRecords from './components/RecentRecords';
import useCoachingDashboard from './useCoachingDashboard';
import './CoachingDashboard.scss';

function CoachingDashboard() {
  const { currentCoach, states } = useCoachingDashboard();

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
      {dataReady && currentCoach && (
        <>
          <div className="coachingDashbaord__header">
            <h1 className="coachingDashbaord__header__title">
              {`Welcome back, ${currentCoach.fullName}!`}
            </h1>
          </div>
          <div className="coachingDashbaordBody">
            {/* Legacy — not yet reimplemented */}
            {/* <IncompleteRecords /> */}
            {/* <MyStudents /> */}
            <div className="coachingDashbaord__recentActivity">
              <RecentRecords coachId={currentCoach.coach_id} />
            </div>
            {/* <MyStudentsBeyond150 coachId={coach.recordId} /> */}
          </div>
        </>
      )}
    </div>
  );
}

export default function CoachingDashboardWrapper() {
  // DateRangeProvider only needed for incomplete weekly records (legacy)
  // return (
  //   <DateRangeProvider>
  //     <CoachingDashboard />
  //   </DateRangeProvider>
  // );
  return <CoachingDashboard />;
}
