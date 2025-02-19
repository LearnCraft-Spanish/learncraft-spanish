import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useUserData } from 'src/hooks/UserData/useUserData';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

import type { Coach, Course, Week } from '../../../types/CoachingTypes';
import LoadingMessage from '../../Loading';
import getDateRange from '../general/functions/dateRange';
import WeeksTable from './Table/WeeksTable';
import CoachingFilter from './Filter/WeeksFilter';

import '../coaching.scss';
import ViewWeekRecord from './ViewWeekRecord';

/*
Notes for Test Cases to write:

- Loads & displays data
- Filters by all filtering options (coach, weeks ago, course) (and others when adding advanced filtering)
- if coach logged in, defaults to that coach is selected
- Pagination works (When implemented)
- Advanced filtering works


*/
export default function WeeksRecordsSection() {
  const userDataQuery = useUserData();
  const { contextual } = useContextualMenu();
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

  const dataReady =
    userDataQuery.isSuccess &&
    weeksQuery.isSuccess &&
    coachListQuery.isSuccess &&
    courseListQuery.isSuccess &&
    activeMembershipsQuery.isSuccess &&
    activeStudentsQuery.isSuccess &&
    groupSessionsQuery.isSuccess &&
    groupAttendeesQuery.isSuccess &&
    assignmentsQuery.isSuccess &&
    privateCallsQuery.isSuccess;

  const dataLoading =
    !dataReady &&
    (userDataQuery.isLoading ||
      weeksQuery.isLoading ||
      coachListQuery.isLoading ||
      courseListQuery.isLoading ||
      activeMembershipsQuery.isLoading ||
      activeStudentsQuery.isLoading ||
      groupSessionsQuery.isLoading ||
      groupAttendeesQuery.isLoading ||
      assignmentsQuery.isLoading ||
      privateCallsQuery.isLoading);

  const dataError =
    !dataReady &&
    (userDataQuery.isError ||
      weeksQuery.isError ||
      coachListQuery.isError ||
      courseListQuery.isError ||
      activeMembershipsQuery.isError ||
      activeStudentsQuery.isError ||
      groupSessionsQuery.isError ||
      groupAttendeesQuery.isError ||
      assignmentsQuery.isError ||
      privateCallsQuery.isError);

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
      const currentUser = userDataQuery.data;
      const currentUserCoach = coachListQuery.data.find(
        (coach) =>
          coach.user.email.toLowerCase() ===
          currentUser?.emailAddress.toLowerCase(),
      );
      if (currentUserCoach) setFilterByCoach(currentUserCoach);
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
      {dataLoading && <LoadingMessage message={'Loading Coaching Data'} />}
      {dataError && <p>Error loading data</p>}
      {dataReady && (
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
              updateWeeksAgoFilter={updateWeeksAgoFilter}
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
        </>
      )}
    </div>
  );
}
