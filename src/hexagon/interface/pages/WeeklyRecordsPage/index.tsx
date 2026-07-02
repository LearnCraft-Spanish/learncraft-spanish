import { useWeeklyRecordsPage } from '@application/useCases/useWeeklyRecordsPage';

const disabledWorkflows = [
  'Legacy weekly records table and filters',
  'Record completion and lesson updates',
  'Assignment create, update, and delete controls',
  'Group session and attendee create, update, and delete controls',
  'Private call create, update, and delete controls',
];

export default function WeeklyRecordsPage() {
  const {
    startDate,
    updateStartDate,
    weeks,
    summary,
    hasSelectedStartDate,
    isLoading,
    error,
    refetch,
  } = useWeeklyRecordsPage();

  return (
    <main className="newCoachingWrapper">
      <h1>Weekly Records Interface</h1>

      <section aria-labelledby="weekly-records-refactor-status">
        <h2 id="weekly-records-refactor-status">Refactor In Progress</h2>
        <p>
          This interface is being rebuilt inside the hexagon. The route is
          available again, and the first read route now loads furnished weekly
          records for one start date. CRUD operations remain disabled until each
          workflow has a migrated data path.
        </p>
      </section>

      <section aria-labelledby="weekly-records-read-route">
        <h2 id="weekly-records-read-route">Read Route</h2>
        <label htmlFor="weekly-records-start-date">Week Start Date</label>
        <input
          id="weekly-records-start-date"
          type="date"
          value={startDate}
          onChange={(event) => updateStartDate(event.target.value)}
        />
        <button
          type="button"
          disabled={!hasSelectedStartDate || isLoading}
          onClick={refetch}
        >
          Refresh Weeks
        </button>

        {!hasSelectedStartDate && (
          <p>Select a week start date to load weekly records.</p>
        )}
        {isLoading && <p>Loading weekly records...</p>}
        {error && <p>Error loading weekly records: {error.message}</p>}
        {hasSelectedStartDate && !isLoading && !error && (
          <div>
            <p>
              Loaded {summary.totalWeeks} weekly records from the new furnished
              weeks route.
            </p>
            <ul>
              <li>Assignments: {summary.totalAssignments}</li>
              <li>Private calls: {summary.totalPrivateCalls}</li>
              <li>Group calls: {summary.totalGroupCalls}</li>
              <li>Group attendees: {summary.totalGroupAttendees}</li>
            </ul>
            {weeks.length === 0 && (
              <p>No weekly records were returned for this start date.</p>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="weekly-records-disabled-workflows">
        <h2 id="weekly-records-disabled-workflows">Currently Disabled</h2>
        <p>
          The legacy implementation is preserved, but the controls below are not
          available from this shell because they rely on outdated route logic.
        </p>
        <ul>
          {disabledWorkflows.map((workflow) => (
            <li key={workflow}>
              <button type="button" disabled>
                {workflow}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="weekly-records-next-steps">
        <h2 id="weekly-records-next-steps">Migration Direction</h2>
        <p>
          New weekly records data access, application orchestration, and UI
          behavior should be added incrementally under <code>src/hexagon/</code>
          . Unmigrated legacy features should remain commented out or
          unreachable rather than deleted.
        </p>
      </section>
    </main>
  );
}
