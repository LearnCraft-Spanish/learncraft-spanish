import type {
  Coach,
  Course,
  GroupSession,
  Week,
} from '../../../types/CoachingTypes';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useCoaching from 'src/hooks/CoachingData/useCoaching';

import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useUserData } from 'src/hooks/UserData/useUserData';
import LoadingMessage from '../../Loading';
import getDateRange from '../general/functions/dateRange';
import { DateRangeProvider } from './DateRangeProvider';
import CoachingFilter from './Filter/WeeksFilter';
import { NewAssignmentView } from './Table/AssignmentsCell';
import { GroupSessionView } from './Table/GroupSessions/GroupSessionsCell';
import WeeksTable from './Table/WeeksTable';
import useDateRange from './useDateRange';

import ViewWeekRecord from './ViewWeekRecord';
import '../coaching.scss';

/*
Notes for Test Cases to write:

- Loads & displays data
- Filters by all filtering options (coach, weeks ago, course) (and others when adding advanced filtering)
- if coach logged in, defaults to that coach is selected
- Pagination works (When implemented)
- Advanced filtering works


*/

// Paramaterizing all queries:
/*
consider using a context, to pass in the startDate and endDate to all the queries
*/
function WeeksRecordsContent() {
  const userDataQuery = useUserData();
  const { contextual } = useContextualMenu();
  const { setStartDate } = useDateRange();
  const {
    weeksQuery,
    coachListQuery,
    courseListQuery,
    activeMembershipsQuery,
    activeStudentsQuery,
    groupSessionsQuery,
    groupAttendeesQuery,
    assignmentsQuery,
    privateCallsQuery,
    getCoachFromMembershipId,
    getCourseFromMembershipId,
    getStudentFromMembershipId,
  } = useCoaching();
  const dateRange = useMemo(() => getDateRange(), []);

  // const queryClient = useQueryClient();

  // const weeksQuery = useQuery({
  //   queryKey: ['weeks'],
  //   queryFn: () => getWeeks(),
  // });

  // Filtering state
  const [advancedFilteringMenu, setAdvancedFilteringMenu] = useState(true);
  const [filterByWeeksAgo, setFilterByWeeksAgo] = useState(
    dateRange.dayOfWeek >= 3 ? 0 : 1,
  ); // 0 for this week, 1 for last week, 2 for two weeks ago
  const [filterByCoach, setFilterByCoach] = useState<Coach | undefined>();
  const [filterByCourse, setFilterByCourse] = useState<Course | undefined>();
  const [filterByCompletion, updateFilterByCompletion] =
    useState<string>('incompleteOnly');
  const [filterByHoldWeeks, setFilterByHoldWeeks] = useState<boolean>(true); // True, filter out hold weeks.
  const [filterByCoachless, setFilterByCoachless] = useState<boolean>(true); // True, exclude students without a coach
  const [filterBySearchTerm, setFilterBySearchTerm] = useState<string>();

  // State for the weeks to display
  const [weeks, setWeeks] = useState<Week[] | undefined>();
  const rendered = useRef(false);

  const initialDataLoad =
    rendered.current === false &&
    userDataQuery.isLoading &&
    weeksQuery.isLoading &&
    coachListQuery.isLoading &&
    courseListQuery.isLoading &&
    activeMembershipsQuery.isLoading &&
    activeStudentsQuery.isLoading &&
    groupSessionsQuery.isLoading &&
    groupAttendeesQuery.isLoading &&
    assignmentsQuery.isLoading &&
    privateCallsQuery.isLoading;

  const dataReady =
    userDataQuery.isSuccess &&
    weeksQuery.isSuccess &&
    coachListQuery.isSuccess &&
    courseListQuery.isSuccess &&
    activeMembershipsQuery.isSuccess &&
    activeStudentsQuery.isSuccess;

  const dataError =
    userDataQuery.isError ||
    weeksQuery.isError ||
    coachListQuery.isError ||
    courseListQuery.isError ||
    activeMembershipsQuery.isError ||
    activeStudentsQuery.isError ||
    groupSessionsQuery.isError ||
    groupAttendeesQuery.isError ||
    assignmentsQuery.isError ||
    privateCallsQuery.isError;

  function updateWeeksAgoFilterHandler(weeksAgo: string) {
    if (weeksAgo === '0' && filterByWeeksAgo !== 0) {
      setStartDate(dateRange.thisWeekDate);
    } else if (weeksAgo === '1' && filterByWeeksAgo !== 1) {
      setStartDate(dateRange.lastSundayDate);
    } else if (weeksAgo === '2' && filterByWeeksAgo !== 2) {
      setStartDate(dateRange.twoSundaysAgoDate);
    }
    updateWeeksAgoFilter(weeksAgo);
  }

  function toggleAdvancedFilteringMenu() {
    setAdvancedFilteringMenu(!advancedFilteringMenu);
  }

  /* ------------------ Update Filter State ------------------ */
  function updateCoachFilter(coachEmail: string) {
    if (!coachListQuery.data) throw new Error('Unable to load coach list');
    const coachToSet = coachListQuery.data.find(
      (coach) => coach.user.email === coachEmail,
    );
    setFilterByCoach(coachToSet);
  }
  function updateCourseFilter(courseName: string | undefined) {
    if (!courseListQuery.data) throw new Error('Unable to load course list');
    const courseToSet = courseListQuery.data.find(
      (course) => course.name === courseName,
    );
    setFilterByCourse(courseToSet);
  }
  function updateWeeksAgoFilter(weeksAgo: string) {
    setFilterByWeeksAgo(Number.parseInt(weeksAgo));
  }
  function updateFilterHoldWeeks(value: boolean) {
    setFilterByHoldWeeks(value);
  }
  function updateFilterBySearchTerm(value: string) {
    setFilterBySearchTerm(value.toLowerCase());
  }

  /* ------------------ Filtering Functions ------------------ */
  const filterByCoachFunction = useCallback(
    (weeks: Week[]) => {
      if (!filterByCoach) return weeks;
      return weeks.filter((week) => {
        const weekCoach = getCoachFromMembershipId(week.relatedMembership);
        return weekCoach === filterByCoach;
      });
    },
    [filterByCoach, getCoachFromMembershipId],
  );
  const filterByCourseFunction = useCallback(
    (weeks: Week[]) => {
      if (!filterByCourse) return weeks;
      return weeks.filter((week) => {
        const weekCourse = getCourseFromMembershipId(week.relatedMembership);
        return weekCourse === filterByCourse;
      });
    },
    [filterByCourse, getCourseFromMembershipId],
  );
  const filterByHoldWeeksFunction = useCallback(
    (weeks: Week[]) => {
      if (!filterByHoldWeeks) return weeks;
      return weeks.filter((week) => !week.holdWeek);
    },
    [filterByHoldWeeks],
  );
  const filterWeeksByWeeksAgoFunction = useCallback(
    (weeks: Week[]) => {
      if (filterByWeeksAgo === 0) {
        return weeks.filter(
          (week) => week.weekStarts === dateRange.thisWeekDate,
        );
      } else if (filterByWeeksAgo === 1) {
        return weeks.filter(
          (week) => week.weekStarts === dateRange.lastSundayDate,
        );
      } else if (filterByWeeksAgo === 2) {
        return weeks.filter(
          (week) => week.weekStarts === dateRange.twoSundaysAgoDate,
        );
      } else {
        return weeks;
      }
    },
    [filterByWeeksAgo, dateRange],
  );
  const filterWeeksByCoachlessFunction = useCallback(
    (weeks: Week[]) => {
      if (!filterByCoachless) return weeks;
      return weeks.filter((week) => {
        const weekCoach = getCoachFromMembershipId(week.relatedMembership);
        return weekCoach;
      });
    },
    [filterByCoachless, getCoachFromMembershipId],
  );
  const filterWeeksBySearchTerm = useCallback(
    (weeks: Week[]) => {
      if (filterBySearchTerm && filterBySearchTerm.length > 0) {
        return weeks.filter((week) => {
          const student = getStudentFromMembershipId(week.relatedMembership);
          if (!student) return false;
          const nameMatches = student.fullName
            ? student.fullName.toLowerCase().includes(filterBySearchTerm)
            : false;
          const emailMatches = student.email
            ? student.email.toLowerCase().includes(filterBySearchTerm)
            : false;
          const noteMatches = week.notes
            ? week.notes.toLowerCase().includes(filterBySearchTerm)
            : false;
          return nameMatches || emailMatches || noteMatches;
        });
      }
      return weeks;
    },
    [filterBySearchTerm, getStudentFromMembershipId],
  );
  const filterByCompletionFunction = useCallback(
    (weeks: Week[]) => {
      if (filterByCompletion === 'incompleteOnly') {
        return weeks.filter((week) => !week.recordsComplete);
      } else if (filterByCompletion === 'completeOnly') {
        return weeks.filter((week) => week.recordsComplete);
      }
      return weeks;
    },
    [filterByCompletion],
  );

  const filterWeeks = useCallback(
    (weeks: Week[]) => {
      if (!dataReady) {
        console.error('Data not ready, cannot filter weeks');
        return weeks;
      }
      const filteredByCoach = filterByCoachFunction(weeks);
      const filteredByWeeksAgo = filterWeeksByWeeksAgoFunction(filteredByCoach);

      const filteredByCourse = filterByCourseFunction(filteredByWeeksAgo);
      const filteredByHoldWeeks = filterByHoldWeeksFunction(filteredByCourse);

      const filteredByCoachless =
        filterWeeksByCoachlessFunction(filteredByHoldWeeks);
      const filteredByCompletion =
        filterByCompletionFunction(filteredByCoachless);
      const filteredBySearchTerm =
        filterWeeksBySearchTerm(filteredByCompletion);

      const filteredWeeks = filteredBySearchTerm;
      return filteredWeeks;
    },
    [
      dataReady,
      filterByCoachFunction,
      filterByCourseFunction,
      filterByHoldWeeksFunction,
      filterWeeksByWeeksAgoFunction,
      filterWeeksByCoachlessFunction,
      filterByCompletionFunction,
      filterWeeksBySearchTerm,
    ],
  );

  // Initial data load, set filterByCoach to current user
  useEffect(() => {
    if (
      !rendered.current &&
      weeksQuery.isSuccess &&
      coachListQuery.isSuccess &&
      userDataQuery.isSuccess
    ) {
      const possibleEmailDomains = [
        '@learncraftspanish.com',
        '@masterofmemory.com',
      ];

      if (userDataQuery.data.emailAddress) {
        const currentUserCoach = coachListQuery.data.find((coach) => {
          const emailPrefix = userDataQuery.data.emailAddress
            .split('@')[0]
            .toLowerCase();
          for (const domain of possibleEmailDomains) {
            if (coach.user.email.toLowerCase() === emailPrefix + domain) {
              return true;
            }
          }
          return false;
        });
        if (currentUserCoach) setFilterByCoach(currentUserCoach);
      }
      rendered.current = true;
    }
  }, [weeksQuery, coachListQuery, userDataQuery]);

  // Filtering useEffect
  useEffect(() => {
    if (dataReady && rendered.current) {
      const filteredWeeks = filterWeeks(weeksQuery.data);
      setWeeks(filteredWeeks);
    }
  }, [dataReady, filterWeeks, weeksQuery.data]);

  return (
    <div className="newCoachingWrapper">
      {initialDataLoad && <LoadingMessage message={'Loading Coaching Data'} />}
      {dataError && <p>Error loading data</p>}
      {rendered.current && (
        <>
          <h2>Weekly Student Records</h2>
          <div className="filterWrapper">
            <CoachingFilter
              dataReady={!!weeks}
              filterByCoach={filterByCoach}
              updateCoachFilter={updateCoachFilter}
              filterByCourse={filterByCourse}
              updateCourseFilter={updateCourseFilter}
              filterByWeeksAgo={filterByWeeksAgo}
              updateWeeksAgoFilter={updateWeeksAgoFilterHandler}
              advancedFilteringMenu={advancedFilteringMenu}
              toggleAdvancedFilteringMenu={toggleAdvancedFilteringMenu}
              searchTerm={filterBySearchTerm || ''}
              updateSearchTerm={updateFilterBySearchTerm}
              filterCoachless={filterByCoachless}
              updateCoachlessFilter={setFilterByCoachless}
              filterHoldWeeks={filterByHoldWeeks}
              updateFilterHoldWeeks={updateFilterHoldWeeks}
              filterByCompletion={filterByCompletion}
              updateFilterByCompletion={updateFilterByCompletion}
            />
          </div>
          <WeeksTable weeks={weeks} />
          {contextual.startsWith('week') && (
            <ViewWeekRecord
              week={weeks?.find(
                (week) => week.recordId === Number(contextual.split('week')[1]),
              )}
            />
          )}
          {contextual === 'newGroupSession' && (
            <GroupSessionView
              groupSession={{ recordId: -1 } as GroupSession}
              newRecord
            />
          )}
          {contextual === 'newAssignment' && (
            <NewAssignmentView
              weekStartsDefaultValue={
                filterByWeeksAgo === 0
                  ? dateRange.thisWeekDate
                  : filterByWeeksAgo === 1
                    ? dateRange.lastSundayDate
                    : dateRange.twoSundaysAgoDate
              }
            />
          )}
        </>
      )}
    </div>
  );
}

// Wrap the main component with the provider
export default function WeeksRecordsSection() {
  return (
    <DateRangeProvider>
      <WeeksRecordsContent />
    </DateRangeProvider>
  );
}
