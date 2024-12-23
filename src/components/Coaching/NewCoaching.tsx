import React, { useEffect, useRef, useState, useCallback } from 'react';

import { useUserData } from '../../hooks/useUserData';
import { useBackend } from '../../hooks/useBackend';
import { useContextualMenu } from '../../hooks/useContextualMenu';
// import { useLastThreeWeeks } from '../../hooks/useLastThreeWeeks';
import useCoaching from '../../hooks/useCoaching';
import type { Week, Coach, Course } from './CoachingTypes';
import NewTable from './NewTable';
import CoachingFilter from './CoachingFilter/CoachingFilter';
export default function Coaching() {
  const userDataQuery = useUserData();
  const {
    lastThreeWeeksQuery,
    coachListQuery,
    courseListQuery,
    getCoachFromMembershipId,
    getCourseFromMembershipId,
  } = useCoaching();
  // const { getNewWeeks } = useBackend();
  const [weeks, setWeeks] = useState<Week[] | undefined>();
  const [filterByCoach, setFilterByCoach] = useState<Coach | undefined>();
  const [filterByCourse, setFilterByCourse] = useState<Course | undefined>();
  const [filterByWeeksAgo, setFilterByWeeksAgo] = useState(0);
  const rendered = useRef(false);

  const dataReady =
    userDataQuery.isSuccess &&
    lastThreeWeeksQuery.isSuccess &&
    coachListQuery.isSuccess &&
    courseListQuery.isSuccess;

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
        console.log('filtering by coach');
        console.log('intiial len', filteredWeeks.length);
        filteredWeeks = filterByCoachFunction(filteredWeeks);
        console.log('final len', filteredWeeks.length);
      }
      if (filterByCourse) {
        filteredWeeks = filterByCourseFunction(filteredWeeks);
      }
      // I dont like the logic with filterByWeeksAgo < 0, it will change it later
      filteredWeeks = filterWeeksByWeeksAgoFunction(filteredWeeks);
      console.log('big final len, ', filteredWeeks.length);
      return filteredWeeks;
    },
    [filterByCoach, filterByCourse, filterByWeeksAgo],
  );

  useEffect(() => {
    if (!rendered.current && lastThreeWeeksQuery.isSuccess) {
      for (const week of lastThreeWeeksQuery.data) {
        if (week.membershipRelatedStudentRecordIdRelatedCoach) {
          console.log(week.membershipRelatedStudentRecordIdRelatedCoach);
        }
      }
      // console.log('weeks', lastThreeWeeksQuery.data);
      rendered.current = true;
    }
  }, [userDataQuery.isSuccess, lastThreeWeeksQuery]);

  useEffect(() => {
    if (dataReady) {
      console.log('filtering weeks!');
      const filteredWeeks = filterWeeks(lastThreeWeeksQuery.data);
      setWeeks(filteredWeeks);
    }
  }, [dataReady, filterWeeks, filterByCoach]);
  return (
    lastThreeWeeksQuery.isSuccess && (
      <div className="newCoaching">
        <div className="filterWrapper">
          <CoachingFilter
            updateCoachFilter={updateCoachFilter}
            updateCourseFilter={updateCourseFilter}
            updateWeeksAgoFilter={updateWeeksAgoFilter}
          />
        </div>
        <div className="tableWrapper">
          <NewTable weeks={weeks} />
        </div>
      </div>
    )
  );
}
