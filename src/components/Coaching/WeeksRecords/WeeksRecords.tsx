import React, { useEffect, useRef, useState, useCallback } from 'react';

import { useUserData } from '../../../hooks/useUserData';
import useCoaching from '../../../hooks/useCoaching';

import type { Week, Coach, Course } from './../CoachingTypes';

import LoadingMessage from '../../Loading';
import WeeksTable from './Table/WeeksTable';
import CoachingFilter from './Filter/WeeksFilter';

import '../styles/coaching.css';

export default function WeeksRecordsSection() {
  const userDataQuery = useUserData();
  const {
    lastThreeWeeksQuery,
    coachListQuery,
    courseListQuery,
    getCoachFromMembershipId,
    getCourseFromMembershipId,
  } = useCoaching();
  // Filtering state
  const [advancedFilteringMenu, setAdvancedFilteringMenu] = useState(false);
  const [filterByWeeksAgo, setFilterByWeeksAgo] = useState(0);
  const [filterByCoach, setFilterByCoach] = useState<Coach | undefined>();
  const [filterByCourse, setFilterByCourse] = useState<Course | undefined>();
  const [filterByIncomplete, setFilterByIncomplete] = useState<
    number | undefined
  >();
  const [filterByHoldWeeks, setFilterByHoldWeeks] = useState<
    boolean | undefined
  >(); // True, filter out hold weeks.
  const [filterByCoachless, setFilterByCoachless] = useState<
    number | undefined
  >();
  const [filterBySearchTerm, setFilterBySearchTerm] = useState<
    string | undefined
  >();

  // State for the weeks to display
  const [weeks, setWeeks] = useState<Week[] | undefined>();
  const rendered = useRef(false);

  const dataReady =
    userDataQuery.isSuccess &&
    lastThreeWeeksQuery.isSuccess &&
    coachListQuery.isSuccess &&
    courseListQuery.isSuccess;

  const dataLoading =
    !dataReady &&
    (userDataQuery.isLoading ||
      lastThreeWeeksQuery.isLoading ||
      coachListQuery.isLoading ||
      courseListQuery.isLoading);

  const dataError =
    !dataReady &&
    (userDataQuery.isError ||
      lastThreeWeeksQuery.isError ||
      coachListQuery.isError ||
      courseListQuery.isError);

  function updateCoachFilter(coachId: string | number) {
    if (!coachListQuery.data) throw new Error('Unable to find coach list');
    const coachToSet = coachListQuery.data.find(
      (coach) => coach.recordId === Number(coachId),
    );
    setFilterByCoach(coachToSet);
  }
  function updateCourseFilter(courseId: string | number) {
    if (!courseListQuery.data) throw new Error('Unable to find course list');
    const courseToSet = courseListQuery.data.find(
      (course) => course.recordId === Number(courseId),
    );
    setFilterByCourse(courseToSet);
  }
  function updateWeeksAgoFilter(weeksAgo: string) {
    setFilterByWeeksAgo(Number.parseInt(weeksAgo));
  }
  function updateFilterHoldWeeks(value: boolean) {
    setFilterByHoldWeeks(value);
  }

  function filterByCoachFunction(weeks: Week[]) {
    if (!filterByCoach) return weeks;
    return weeks.filter((week) => {
      const weekCoach = getCoachFromMembershipId(week.relatedMembership);
      return weekCoach === filterByCoach;
    });
  }
  function filterByCourseFunction(weeks: Week[]) {
    if (!filterByCourse) return weeks;
    return weeks.filter((week) => {
      const weekCourse = getCourseFromMembershipId(week.relatedMembership);
      return weekCourse === filterByCourse;
    });
  }

  function filterWeeksByWeeksAgoFunction(weeks: Week[]) {
    if (filterByWeeksAgo < 0) return weeks;
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const daysSinceSunday = dayOfWeek; // Number of days since the most recent Sunday
    const millisecondsInADay = 86400000; // Number of milliseconds in a day
    const thisSundayTimestamp =
      now.getTime() - daysSinceSunday * millisecondsInADay;

    const chosenSundayTimestamp =
      thisSundayTimestamp - filterByWeeksAgo * millisecondsInADay * 7;
    const sunday = new Date(chosenSundayTimestamp);

    const sundayText = sunday.toISOString().split('T')[0];

    return weeks.filter((week) => week.weekStarts === sundayText);
  }

  const filterWeeks = useCallback(
    (weeks: Week[]) => {
      let filteredWeeks = weeks;
      if (filterByCoach) {
        filteredWeeks = filterByCoachFunction(filteredWeeks);
      }
      if (filterByCourse) {
        filteredWeeks = filterByCourseFunction(filteredWeeks);
      }
      // I dont like the logic with filterByWeeksAgo < 0, i will change it later
      filteredWeeks = filterWeeksByWeeksAgoFunction(filteredWeeks); //FOLLOW SAME PATTERN AS ABOVE, PLEASE
      return filteredWeeks;
    },
    [filterByCoach, filterByCourse, filterByWeeksAgo],
  );

  useEffect(() => {
    if (!rendered.current && lastThreeWeeksQuery.isSuccess) {
      rendered.current = true;
    }
  }, [userDataQuery.isSuccess, lastThreeWeeksQuery]);

  useEffect(() => {
    if (dataReady) {
      console.log('filtering weeks!');
      const filteredWeeks = filterWeeks(lastThreeWeeksQuery.data);
      setWeeks(filteredWeeks);
    }
  }, [dataReady, filterWeeks]);

  return (
    <div className="newCoachingWrapper">
      {dataLoading && <LoadingMessage message={'Loading Coaching Data'} />}
      {dataError && <p>Error loading data</p>}
      {dataReady && (
        <>
          <div className="filterWrapper">
            <CoachingFilter
              weeks={weeks}
              searchTerm={filterBySearchTerm || ''}
              updateSearchTerm={setFilterBySearchTerm}
              filterCoachless={filterByCoachless || 0}
              updateCoachlessFilter={setFilterByCoachless}
              filterHoldWeeks={filterByHoldWeeks || 0}
              updateFilterHoldWeeks={updateFilterHoldWeeks}
              filterIncomplete={filterByIncomplete || 0}
              updateFilterIncomplete={setFilterByIncomplete}
              updateCoachFilter={updateCoachFilter}
              updateCourseFilter={updateCourseFilter}
              updateWeeksAgoFilter={updateWeeksAgoFilter}
              advancedFilteringMenu={advancedFilteringMenu}
              toggleAdvancedFilteringMenu={() =>
                setAdvancedFilteringMenu(!advancedFilteringMenu)
              }
            />
          </div>
          <div className="tableWrapper">
            <WeeksTable weeks={weeks} />
          </div>
        </>
      )}
    </div>
  );
}
