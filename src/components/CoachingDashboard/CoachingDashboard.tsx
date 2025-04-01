import { DateRangeProvider } from '../Coaching/WeeksRecords/DateRangeProvider';
import WeeksTable from '../Coaching/WeeksRecords/Table/WeeksTable';
import { InlineLoading, Loading } from '../Loading';
import RecentRecords from './components/RecentRecords';
import useCoachingDashboard from './useCoachingDashboard';
import './CoachingDashboard.scss';

function CoachingDashboard() {
  const { coach, myIncompleteWeeklyRecords, states } = useCoachingDashboard();

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
            <h1>Coaching Dashboard</h1>
            <h2>Welcome back, {coach?.user.name}</h2>
          </div>
          <div className="coachingDashbaord__content">
            {/* Records to Complete */}
            <div className="coachingDashbaord__recordsToComplete">
              <h3>Records to Complete</h3>
              {myIncompleteWeeklyRecords === undefined ? (
                <InlineLoading message="Loading records..." />
              ) : (
                <WeeksTable
                  weeks={myIncompleteWeeklyRecords ?? []}
                  tableEditMode={false}
                  setTableEditMode={() => {}}
                  hiddenFields={[]}
                  sortByStudent={false}
                  handleUpdateSortByStudent={() => {}}
                  sortDirection={'none'}
                />
              )}
            </div>
            {/* Student Drill Down */}
            <div className="coachingDashbaord__studentDrillDown">
              <h3>Student Drill Down</h3>
              <ul></ul>
            </div>
            {/* Recent Activity */}
            <div className="coachingDashbaord__recentActivity">
              <RecentRecords />
            </div>
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
