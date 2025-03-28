import { useMemo } from 'react';
import { DateRangeProvider } from '../Coaching/WeeksRecords/DateRangeProvider';
import WeeksTable from '../Coaching/WeeksRecords/Table/WeeksTable';
import useDateRange from '../Coaching/WeeksRecords/useDateRange';
import { InlineLoading, Loading } from '../Loading';
import { useCoachingDashboard } from './useCoachingDashboard';
import useMyIncompleteWeeklyRecords from './useMyIncompleteWeeklyRecords';

function CoachingDashboard() {
  const { isLoading, isError, dataReady, coach } = useCoachingDashboard();
  const { getMyIncompleteWeeklyRecords } = useMyIncompleteWeeklyRecords();
  const { startDate } = useDateRange();

  const myIncompleteWeeklyRecords = useMemo(() => {
    if (!dataReady || !coach) return undefined;
    return getMyIncompleteWeeklyRecords(coach?.user);
  }, [coach, getMyIncompleteWeeklyRecords, dataReady]);

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
                  weeks={myIncompleteWeeklyRecords}
                  startDate={startDate}
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
              <h3>My Recent Records</h3>
              <ul></ul>
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
