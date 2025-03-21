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
import { Loading } from 'src/components/Loading';

import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { DateRangeProvider } from './DateRangeProvider';
import CoachingFilter from './Filter/WeeksFilter';
import { NewAssignmentView } from './Table/AssignmentsCell';
import { GroupSessionView } from './Table/GroupSessionsCell';
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
  const { startDate } = useDateRange();
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
  // const queryClient = useQueryClient();

  // const weeksQuery = useQuery({
  //   queryKey: ['weeks'],
  //   queryFn: () => getWeeks(),
  // });

  // Filtering state
  const [filterByOneMonthChallenge, setFilterByOneMonthChallenge] =
    useState<boolean>(true);
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

  const [tableEditMode, setTableEditMode] = useState(false);

  const initialDataLoad =
    rendered.current === false &&
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

  const hiddenFields = useMemo(() => {
    const fields = [];
    if (filterByCoach) fields.push('primaryCoach');
    if (filterByCourse) fields.push('level');
    return fields;
  }, [filterByCoach, filterByCourse]);

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
  function updateFilterHoldWeeks(value: boolean) {
    setFilterByHoldWeeks(value);
  }
  function updateFilterByOneMonthChallenge(value: boolean) {
    setFilterByOneMonthChallenge(value);
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
  const filterByOneMonthChallengeFunction = useCallback(
    (weeks: Week[]) => {
      if (!filterByOneMonthChallenge) return weeks;
      return weeks.filter((week) => week.level !== '1-Month Challenge');
    },
    [filterByOneMonthChallenge],
  );
  const filterWeeksByWeeksAgoFunction = useCallback(
    (weeks: Week[]) => {
      return weeks.filter((week) => week.weekStarts === startDate);
    },
    [startDate],
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
      const filteredByOneMonthChallenge =
        filterByOneMonthChallengeFunction(filteredByWeeksAgo);
      const filteredByCourse = filterByCourseFunction(
        filteredByOneMonthChallenge,
      );
      const filteredByHoldWeeks = filterByHoldWeeksFunction(filteredByCourse);

      const filteredByCoachless =
        filterWeeksByCoachlessFunction(filteredByHoldWeeks);
      const filteredByCompletion =
        filterByCompletionFunction(filteredByCoachless);
      const filteredBySearchTerm =
        filterWeeksBySearchTerm(filteredByCompletion);

      // sort by relatedStudent
      // firster first by level, then by weekName
      const filteredWeeks = filteredBySearchTerm.sort((a, b) => {
        if (a.level !== b.level) {
          return a.level.localeCompare(b.level);
        }
        return a.weekName.localeCompare(b.weekName);
      });
      return filteredWeeks;
    },
    [
      dataReady,
      filterByCoachFunction,
      filterByCourseFunction,
      filterByHoldWeeksFunction,
      filterByOneMonthChallengeFunction,
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
      {initialDataLoad && <Loading message={'Loading Coaching Data...'} />}
      {dataError && <p>Error loading data</p>}
      {rendered.current && (
        <>
          {tableEditMode ? (
            <h2>Edit Weekly Records</h2>
          ) : (
            <h2>Weekly Student Records</h2>
          )}
          {!tableEditMode && (
            <div className="filterWrapper">
              <CoachingFilter
                dataReady={!!weeks}
                filterByCoach={filterByCoach}
                updateCoachFilter={updateCoachFilter}
                filterByCourse={filterByCourse}
                updateCourseFilter={updateCourseFilter}
                searchTerm={filterBySearchTerm || ''}
                updateSearchTerm={updateFilterBySearchTerm}
                filterCoachless={filterByCoachless}
                updateCoachlessFilter={setFilterByCoachless}
                filterHoldWeeks={filterByHoldWeeks}
                updateFilterHoldWeeks={updateFilterHoldWeeks}
                filterByCompletion={filterByCompletion}
                updateFilterByCompletion={updateFilterByCompletion}
                filterByOneMonthChallenge={filterByOneMonthChallenge}
                updateFilterByOneMonthChallenge={
                  updateFilterByOneMonthChallenge
                }
              />
            </div>
          )}
          <WeeksTable
            weeks={weeks}
            tableEditMode={tableEditMode}
            setTableEditMode={setTableEditMode}
            hiddenFields={hiddenFields}
          />
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
            <NewAssignmentView weekStartsDefaultValue={startDate} />
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
