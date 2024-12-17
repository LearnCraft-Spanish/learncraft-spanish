import React, { useEffect, useRef, useState } from 'react';

import { useUserData } from '../../hooks/useUserData';
import { useBackend } from '../../hooks/useBackend';
import { useContextualMenu } from '../../hooks/useContextualMenu';

import type { Coach } from '../../interfaceDefinitions';

export default function Coaching() {
  const userDataQuery = useUserData();
  const {
    getActiveMemberships,
    getActiveStudents,
    getCoachList,
    getCourseList,
    getLastThreeWeeks,
    getLessonList,
  } = useBackend();

  const [startupDataLoaded, setStartupDataLoaded] = useState(false);
  const [weeksToDisplay, setWeeksToDisplay] = useState([]);
  const [filterByCoach, setFilterByCoach] = useState({});
  const coaches = useRef<Coach[]>([]);
  const weekRecords = useRef<any[]>([]);
  const privateCalls = useRef<any[]>([]);
  const groupCalls = useRef<any[]>([]);
  const groupAttendees = useRef<any[]>([]);
  const assignments = useRef<any[]>([]);

  const coachUser = useRef(null);
  function updateCoachFilter(coachId: string) {
    const coachToSet =
      coaches.current.find((coach) => coach.recordId === Number(coachId)) || {};
    setFilterByCoach(coachToSet);
  }

  async function makeCoachList() {
    const coachList = await getCoachList().then((result) => {
      result.sort((a, b) => {
        if (a.user && b.user) {
          return a.user.name > b.user.name ? 1 : -1;
        }
        return 0;
      });
      return result;
    });
    return coachList;
  }

  function makeCoachSelector() {
    const coachSelector = [
      <option key={0} value={0}>
        All Coaches
      </option>,
    ];
    coaches.current.forEach((coach) => {
      const coachHasActiveStudent =
        students.current.filter(
          (student) =>
            (student.primaryCoach ? student.primaryCoach.id : undefined) ===
            (coach.user ? coach.user.id : 0),
        ).length > 0;
      if (coachHasActiveStudent) {
        coachSelector.push(
          <option key={coach.recordId} value={coach.recordId}>
            {coach.user.name}
          </option>,
        );
      }
    });
    return coachSelector;
  }
  function filterWeeksByCoach(weeks: any, coach: any) {
    if (coach.user) {
      const coachEmail = coach.user.email;
      return weeks.filter(
        (week) =>
          (getCoachFromMembershipId(week.relatedMembership).recordId
            ? getCoachFromMembershipId(week.relatedMembership).user.email
            : '') === coachEmail,
      );
    } else {
      return weeks;
    }
  }

  async function getThreeWeeksOfRecords() {
    const studentRecords = await getLastThreeWeeks();
    return studentRecords;
  }

  async function loadStartupData() {
    // const studentsPromise = makeStudentList();
    // const membershipsPromise = makeMembershipList();
    const weekRecordsPromise = getThreeWeeksOfRecords();
    const coachesPromise = makeCoachList();
    // const coursesPromise = makeCourseList();
    // const lessonsPromise = makeLessonList();
    const results = await Promise.all([
      // studentsPromise,
      // membershipsPromise,
      weekRecordsPromise,
      coachesPromise,
      // coursesPromise,
      // lessonsPromise,
    ]);

    // console.log(results[2]);
    // students.current = results[0];
    // memberships.current = results[1];
    weekRecords.current = results[0][0];
    privateCalls.current = results[0][1];
    groupCalls.current = results[0][2];
    groupAttendees.current = results[0][3];
    assignments.current = results[0][4];
    coaches.current = results[1];
    // courses.current = results[4];
    // lessons.current = results[5];
    setStartupDataLoaded(true);
  }

  function combinedFilterWeeks(weeks: any) {
    const filteredByCoach = filterWeeksByCoach(weeks, filterByCoach);
    return filteredByCoach;
  }

  // Load Startup Data
  useEffect(() => {
    if (!startupDataLoaded) {
      loadStartupData();
    }
  }, []);
  // Set Coach Filter
  useEffect(() => {
    if (startupDataLoaded) {
      coachUser.current =
        coaches.current.find(
          (coach) => coach.user.email === userDataQuery.data?.emailAddress,
        ) || null;
      if (coachUser.current) {
        updateCoachFilter(coachUser.current.recordId);
      }
    }
  }, [startupDataLoaded, userDataQuery.data]);

  // set data
  useEffect(() => {
    if (startupDataLoaded) {
      setWeeksToDisplay(combinedFilterWeeks(weekRecords.current));
    }
  }, [startupDataLoaded, filterByCoach]);

  return <div></div>;
}