import type {
  Coach,
  FurnishedWeekWithCoach,
  SrCourse,
} from '@learncraft-spanish/shared';

import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { Loading } from '@interface/components/Loading';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAllSrCoursesQuery } from 'src/hexagon/application/queries/CoachingStudentQueries/useAllSrCoursesQuery';
import { useAllCoachesQuery } from 'src/hexagon/application/queries/CoachQueries/useAllCoachesQuery';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { DateRangeProvider } from './DateRangeProvider';
import WeeksFilter from './Filter/WeeksFilter';
import { NewAssignmentView } from './Table/AssignmentsCell';
import WeeksTable from './Table/WeeksTable';
import useDateRange from './useDateRange';
import '../coaching.scss';

type SortDirection = 'none' | 'ascending' | 'descending';

const _WeeksRecordsContent = function WeeksRecordsContent() {
  const { isAuthenticated, authUser } = useAuthAdapter();
  const { startDate } = useDateRange();
  const { weeks: unfilteredWeeks } = useWeeksByStartDate(startDate);
  const { coaches } = useAllCoachesQuery();
  const { srCourses, isLoading: srCoursesLoading } = useAllSrCoursesQuery();
  // const {
  //   weeksQuery,
  //   coachListQuery,
  //   courseListQuery,
  //   activeMembershipsQuery,
  //   activeStudentsQuery,
  //   groupSessionsQuery,
  //   groupAttendeesQuery,
  //   assignmentsQuery,
  //   privateCallsQuery,
  //   getCoachFromMembershipId,
  //   getCourseFromMembershipId,
  //   getStudentFromMembershipId,
  // } = useCoaching();

  // Filtering state
  const [filterByOneMonthChallenge, setFilterByOneMonthChallenge] =
    useState<boolean>(true);
  const [filterByCoach, setFilterByCoach] = useState<Coach | undefined>();
  const [filterByCourse, setFilterByCourse] = useState<SrCourse | undefined>();
  const [filterByCompletion, updateFilterByCompletion] =
    useState<string>('incompleteOnly');
  const [filterByHoldWeeks, setFilterByHoldWeeks] = useState<boolean>(true); // True, filter out hold weeks.
  const [filterByCoachless, setFilterByCoachless] = useState<boolean>(true); // True, exclude students without a coach
  const [filterBySearchTerm, setFilterBySearchTerm] = useState<string>();

  // State for the weeks to display
  const [filteredWeeks, setFilteredWeeks] = useState<
    FurnishedWeekWithCoach[] | undefined
  >();
  const rendered = useRef(false);
  const { contextual } = useContextualMenu();
  // const [tableEditMode, setTableEditMode] = useState(false);
  const tableEditMode = false;

  // State for sorting
  const [sortByStudent, setSortByStudent] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<SortDirection>('none');

  // const initialDataLoad =
  //   rendered.current === false &&
  //   (isLoading ||
  //     weeksQuery.isLoading ||
  //     coachListQuery.isLoading ||
  //     courseListQuery.isLoading ||
  //     activeMembershipsQuery.isLoading ||
  //     activeStudentsQuery.isLoading ||
  //     groupSessionsQuery.isLoading ||
  //     groupAttendeesQuery.isLoading ||
  //     assignmentsQuery.isLoading ||
  //     privateCallsQuery.isLoading);

  // const dataReady =
  //   isAuthenticated &&
  //   weeksQuery.isSuccess &&
  //   coachListQuery.isSuccess &&
  //   courseListQuery.isSuccess &&
  //   activeMembershipsQuery.isSuccess &&
  //   activeStudentsQuery.isSuccess &&
  //   groupSessionsQuery.isSuccess &&
  //   groupAttendeesQuery.isSuccess &&
  //   assignmentsQuery.isSuccess &&
  //   privateCallsQuery.isSuccess;

  // const dataError =
  //   weeksQuery.isError ||
  //   coachListQuery.isError ||
  //   courseListQuery.isError ||
  //   activeMembershipsQuery.isError ||
  //   activeStudentsQuery.isError ||
  //   groupSessionsQuery.isError ||
  //   groupAttendeesQuery.isError ||
  //   assignmentsQuery.isError ||
  //   privateCallsQuery.isError;

  const hiddenFields = useMemo(() => {
    const fields = [];
    if (filterByCoach) fields.push('primaryCoach');
    if (filterByCourse) fields.push('level');
    return fields;
  }, [filterByCoach, filterByCourse]);

  /* ------------------ Update Filter State ------------------ */
  function updateCoachFilter(coachEmail: string) {
    if (!coaches) throw new Error('Unable to load coach list');
    const coachToSet = coaches.find((coach) => coach.email === coachEmail);
    setFilterByCoach(coachToSet);
  }
  function updateCourseFilter(courseName: string | undefined) {
    if (srCoursesLoading || !srCourses)
      throw new Error('Unable to load course list');
    const courseToSet = srCourses.find((course) => course.name === courseName);
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
    (weeks: FurnishedWeekWithCoach[]) => {
      if (!filterByCoach) return weeks;
      return weeks.filter((week) => {
        return week.coach.coach_id === filterByCoach.coach_id;
      });
    },
    [filterByCoach],
  );
  const filterByCourseFunction = useCallback(
    (weeks: FurnishedWeekWithCoach[]) => {
      if (!filterByCourse) return weeks;
      return weeks.filter((week) => {
        return week.srCourseName === filterByCourse.name;
      });
    },
    [filterByCourse],
  );
  const filterByHoldWeeksFunction = useCallback(
    (weeks: FurnishedWeekWithCoach[]) => {
      if (!filterByHoldWeeks) return weeks;
      return weeks.filter((week) => !week.holdWeek);
    },
    [filterByHoldWeeks],
  );
  const filterByOneMonthChallengeFunction = useCallback(
    (weeks: FurnishedWeekWithCoach[]) => {
      if (!filterByOneMonthChallenge) return weeks;
      return weeks.filter((week) => week.srCourseName !== '1-Month Challenge');
    },
    [filterByOneMonthChallenge],
  );
  const filterWeeksByWeeksAgoFunction = useCallback(
    (weeks: FurnishedWeekWithCoach[]) => {
      return weeks.filter((week) => week.weekStarts === startDate);
    },
    [startDate],
  );
  const filterWeeksByCoachlessFunction = useCallback(
    (weeks: FurnishedWeekWithCoach[]) => {
      if (!filterByCoachless) return weeks;
      return weeks.filter((week) => {
        return week?.coach.coach_id > 0;
      });
    },
    [filterByCoachless, filterByCoach],
  );
  const filterWeeksBySearchTerm = useCallback(
    (weeks: FurnishedWeekWithCoach[]) => {
      if (filterBySearchTerm && filterBySearchTerm.length > 0) {
        return weeks.filter((week) => {
          return (
            week.student.fullName.toLowerCase().includes(filterBySearchTerm) ||
            week.student.email.toLowerCase().includes(filterBySearchTerm) ||
            week.notes?.toLowerCase().includes(filterBySearchTerm) ||
            false
          );
        });
      }
      return weeks;
    },
    [filterBySearchTerm],
  );
  const filterByCompletionFunction = useCallback(
    (weeks: FurnishedWeekWithCoach[]) => {
      if (filterByCompletion === 'incompleteOnly') {
        return weeks.filter((week) => !week.recordComplete);
      } else if (filterByCompletion === 'completeOnly') {
        return weeks.filter((week) => week.recordComplete);
      }
      return weeks;
    },
    [filterByCompletion],
  );
  const handleUpdateSortByStudent = useCallback(() => {
    if (!sortByStudent) {
      setSortByStudent(true);
      setSortDirection('ascending');
    } else {
      if (sortDirection === 'ascending') {
        setSortDirection('descending');
      } else {
        setSortByStudent(false);
        setSortDirection('none');
      }
    }
  }, [sortByStudent, sortDirection]);

  const sortWeeks = useCallback(
    (weeksToSort: FurnishedWeekWithCoach[]) => {
      if (!sortByStudent) {
        return weeksToSort;
      }
      if (sortDirection === 'none') {
        return weeksToSort;
      }

      return [...weeksToSort].sort((a, b) => {
        let comparison = 0;
        // Foreign Key lookup, form data in backend?
        const studentA = a.student.fullName;
        // Foreign Key lookup, form data in backend?
        const studentB = b.student.fullName;
        comparison = studentB.localeCompare(studentA);

        return sortDirection === 'ascending' ? -comparison : comparison;
      });
    },
    [sortByStudent, sortDirection],
  );

  const filterWeeks = useCallback(
    (weeksToFilter: FurnishedWeekWithCoach[]) => {
      if (srCoursesLoading || !srCourses) {
        console.error('Data not ready, cannot filter weeks');
        return weeksToFilter;
      }
      const filteredByCoach = filterByCoachFunction(weeksToFilter);
      // const filteredByWeeksAgo = filterWeeksByWeeksAgoFunction(filteredByCoach);
      const filteredByOneMonthChallenge =
        filterByOneMonthChallengeFunction(filteredByCoach);

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

      // Apply sorting after all filters
      return sortWeeks(filteredBySearchTerm);
    },
    [
      srCoursesLoading,
      srCourses,
      filterByCoachFunction,
      filterByCourseFunction,
      filterByHoldWeeksFunction,
      filterByOneMonthChallengeFunction,
      filterWeeksByWeeksAgoFunction,
      filterWeeksByCoachlessFunction,
      filterByCompletionFunction,
      filterWeeksBySearchTerm,
      sortWeeks,
    ],
  );

  // Initial data load, set filterByCoach to current user
  useEffect(() => {
    if (!rendered.current && coaches && srCourses) {
      const defaultCoach = coaches.find(
        (coach) => coach.email === authUser?.email,
      );
      if (defaultCoach) setFilterByCoach(defaultCoach);
      rendered.current = true;
    }
  }, [coaches, srCourses, authUser, isAuthenticated]);

  // Filtering useEffect
  useEffect(() => {
    if (!srCoursesLoading && srCourses && rendered.current) {
      const filteredWeeks = filterWeeks(unfilteredWeeks);
      setFilteredWeeks(filteredWeeks);
    }
  }, [
    srCoursesLoading,
    srCourses,
    unfilteredWeeks,
    rendered.current,
    filterWeeks,
  ]);

  return (
    <div className="newCoachingWrapper">
      {srCoursesLoading && <Loading message={'Loading Coaching Data...'} />}
      {/* {srCoursesError && <p>Error loading data</p>} */}
      {coaches && srCourses && rendered.current && (
        <>
          {tableEditMode ? (
            <h2>Edit Weekly Records</h2>
          ) : (
            <h2>Weekly Student Records</h2>
          )}
          {!tableEditMode && (
            <div className="filterWrapper">
              <WeeksFilter
                dataReady={!!filteredWeeks}
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
            weeks={filteredWeeks}
            tableEditMode={tableEditMode}
            // setTableEditMode={setTableEditMode}
            hiddenFields={hiddenFields}
            sortByStudent={sortByStudent}
            handleUpdateSortByStudent={handleUpdateSortByStudent}
            sortDirection={sortDirection}
          />
          {/* {contextual.startsWith('week') && (
            <ViewWeekRecord
              week={weeks?.find(
                (week) => week.recordId === Number(contextual.split('week')[1]),
              )}
            />
          )} */}
          {/* {contextual === 'newGroupSession' && (
            <GroupSessionView
              groupSession={{ recordId: -1 } as GroupSession}
              newRecord
            />
          )} */}
          {contextual === 'newAssignment' && (
            <NewAssignmentView weekStartsDefaultValue={startDate} />
          )}
        </>
      )}
    </div>
  );
};

// Wrap the main component with the provider
export default function WeeksRecordsSection() {
  return (
    <DateRangeProvider>
      <_WeeksRecordsContent />
    </DateRangeProvider>
  );
}
