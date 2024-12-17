// src/Coaching.jsx

import React, { useEffect, useRef, useState } from 'react';

import { useUserData } from '../../hooks/useUserData';

import { useBackend } from '../../hooks/useBackend';
import { useContextualMenu } from '../../hooks/useContextualMenu';
import CoachingFilter from './CoachingFilter/CoachingFilter';
import StudentRecordsTable from './StudentRecordsTable/StudentRecordsTable';
import './stylesOld.css';

export default function Coaching() {
  const { contextual, openContextual, closeContextual, setContextualRef } =
    useContextualMenu();
  const userDataQuery = useUserData();
  const {
    getActiveMemberships,
    getActiveStudents,
    getCoachList,
    getCourseList,
    getLastThreeWeeks,
    getLessonList,
  } = useBackend();
  const [weeksToDisplay, setWeeksToDisplay] = useState([]);
  const [startupDataLoaded, setStartupDataLoaded] = useState(false);
  const [filterByCoach, setFilterByCoach] = useState({});
  const [filterByCourse, setFilterByCourse] = useState({});
  const [filterByWeeksAgo, setFilterByWeeksAgo] = useState(0);
  const [filterCoachless, setFilterCoachless] = useState(1);
  const [filterHoldWeeks, setFilterHoldWeeks] = useState(1);
  const [filterIncomplete, setFilterIncomplete] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const rendered = useRef(false);
  const students = useRef([]);
  const memberships = useRef([]);
  const weekRecords = useRef([]);
  const coaches = useRef([]);
  const courses = useRef([]);
  const lessons = useRef([]);
  const privateCalls = useRef([]);
  const groupCalls = useRef([]);
  const groupAttendees = useRef([]);
  const assignments = useRef([]);
  const currentAttendee = useRef(null);
  const coachUser = useRef(null);

  function updateSearchTerm(term: string) {
    setSearchTerm(term.toLowerCase());
  }

  function updateCoachFilter(coachId: string | number) {
    const coachToSet =
      coaches.current.find((coach) => coach.recordId === Number(coachId)) || {};
    setFilterByCoach(coachToSet);
  }

  function updateCourseFilter(courseId: string | number) {
    const courseToSet =
      courses.current.find((course) => course.recordId === Number(courseId)) ||
      {};
    setFilterByCourse(courseToSet);
  }

  function updateWeeksAgoFilter(weeksAgo: string) {
    setFilterByWeeksAgo(Number.parseInt(weeksAgo));
  }

  function updateCoachlessFilter(argument: string) {
    setFilterCoachless(Number.parseInt(argument));
  }

  function updateHoldFilter(argument: string) {
    setFilterHoldWeeks(Number.parseInt(argument));
  }

  function updateFilterIncomplete(argument: string) {
    setFilterIncomplete(Number.parseInt(argument));
  }

  function openStudentPopup(recordId: number) {
    openContextual(`student${recordId}`);
  }

  function openCallPopup(recordId: number) {
    openContextual(`call${recordId}`);
  }

  function openNewCallPopup(weekRecordId: number) {
    openContextual(`newCallForWeek${weekRecordId}`);
  }

  function openGroupSessionPopup(recordId: number) {
    currentAttendee.current = null;
    openContextual(`groupSession${recordId}`);
  }

  function openAttendeePopup(recordId: number) {
    openContextual(`attendee${recordId}`);
  }

  function openAssignmentPopup(recordId: number) {
    openContextual(`assignment${recordId}`);
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

  async function makeCourseList() {
    const courseList = await getCourseList().then((result) => {
      result.sort((a, b) => (a.name > b.name ? 1 : -1));
      return result;
    });
    return courseList;
  }

  async function makeLessonList() {
    const lessonList = await getLessonList();
    return lessonList;
  }

  async function getThreeWeeksOfRecords() {
    const studentRecords = await getLastThreeWeeks();
    return studentRecords;
  }

  async function makeStudentList() {
    const studentRecords = await getActiveStudents();
    return studentRecords;
  }

  async function makeMembershipList() {
    const studentRecords = await getActiveMemberships();
    return studentRecords;
  }

  async function loadStartupData() {
    const studentsPromise = makeStudentList();
    const membershipsPromise = makeMembershipList();
    const weekRecordsPromise = getThreeWeeksOfRecords();
    const coachesPromise = makeCoachList();
    const coursesPromise = makeCourseList();
    const lessonsPromise = makeLessonList();
    Promise.all([
      studentsPromise,
      membershipsPromise,
      weekRecordsPromise,
      coachesPromise,
      coursesPromise,
      lessonsPromise,
    ]).then((results) => {
      console.log(results[2]);
      students.current = results[0];
      memberships.current = results[1];
      weekRecords.current = results[2][0];
      privateCalls.current = results[2][1];
      groupCalls.current = results[2][2];
      groupAttendees.current = results[2][3];
      assignments.current = results[2][4];
      coaches.current = results[3];
      courses.current = results[4];
      lessons.current = results[5];
      setStartupDataLoaded(true);
    }, console.error("couldn't load data"));
  }

  function dateObjectToText(dateObject: Date) {
    function formatMonth(date: Date) {
      const unformattedMonth = date.getMonth() + 1;
      return unformattedMonth < 10
        ? `0${unformattedMonth}`
        : `${unformattedMonth}`;
    }
    function formatDate(date: Date) {
      let dateString = date.getDate().toString();
      if (Number(dateString) < 10) {
        dateString = `0${dateString}`;
      }
      return dateString;
    }

    function formatYear(date: Date) {
      return date.getFullYear().toString();
    }
    return `${formatYear(dateObject)}-${formatMonth(dateObject)}-${formatDate(dateObject)}`;
  }

  function getStudentFromMembershipId(membershipId: number) {
    const membership =
      memberships.current.find((item) => item.recordId === membershipId) || {};
    const studentId = membership.relatedStudent;
    return students.current.find((item) => item.recordId === studentId) || {};
  }

  function getCoachFromMembershipId(membershipId: number) {
    const membership =
      memberships.current.find((item) => item.recordId === membershipId) || {};
    const studentId = membership.relatedStudent;
    const student =
      students.current.find((item) => item.recordId === studentId) || {};
    const userObject = student.primaryCoach || {};
    return (
      coaches.current.find((coach) => coach.user.id === userObject.id) || {}
    );
  }

  function getCourseFromMembershipId(membershipId: number) {
    const membership =
      memberships.current.find((item) => item.recordId === membershipId) || {};
    const courseId = membership.relatedCourse;
    return courses.current.find((item) => item.recordId === courseId) || {};
  }

  function getLessonFromRecordId(lessonId: number) {
    return lessons.current.find((item) => item.recordId === lessonId) || {};
  }

  function getPrivateCallsFromWeekId(weekId: number) {
    return privateCalls.current.filter((call) => call.relatedWeek === weekId);
  }

  function getGroupSessionsFromWeekId(weekId: number) {
    const groupAttendeeList =
      groupAttendees.current.filter(
        (attendee) => attendee.student === weekId,
      ) || [];
    // if (typeof groupAttendeeList !== 'object') {
    //   console.log(typeof groupAttendeeList)
    // }
    if (groupAttendeeList.length > 0) {
      const groupSessionList =
        groupAttendeeList.map((attendee) =>
          groupCalls.current.find(
            (call) => call.recordId === attendee.groupSession,
          ),
        ) || [];
      return groupSessionList.filter((item) => item);
    } else {
      return [];
    }
  }

  function getAttendeeWeeksFromGroupSessionId(sessionId: number) {
    const attendeeList =
      groupAttendees.current.filter(
        (attendee) => attendee.groupSession === sessionId,
      ) || [];
    const weekList =
      attendeeList.map(
        (attendee) =>
          weekRecords.current.find(
            (week) => week.recordId === attendee.student,
          ) || {},
      ) || [];
    return weekList;
  }

  function getAssignmentsFromWeekId(weekId: number) {
    return assignments.current.filter(
      (assignment) => assignment.relatedWeek === weekId,
    );
  }

  function getMembershipFromWeekId(weekId: number) {
    const week =
      weekRecords.current.find((week) => week.recordId === weekId) || {};
    const membershipId = week.relatedMembership;
    return memberships.current.find(
      (membership) => membership.recordId === membershipId,
    );
  }

  function weekGetsPrivateCalls(weekId: number) {
    const membership = getMembershipFromWeekId(weekId);
    const course = getCourseFromMembershipId(membership.recordId);
    return course.weeklyPrivateCalls > 0;
  }

  function weekGetsGroupCalls(weekId: number) {
    const membership = getMembershipFromWeekId(weekId);
    const course = getCourseFromMembershipId(membership.recordId);
    return course.hasGroupCalls;
  }

  function filterWeeksBySearchTerm(array: any[], searchTerm: string) {
    if (searchTerm.length > 0) {
      function filterFunction(week) {
        const student = getStudentFromMembershipId(week.relatedMembership);
        const nameMatches = student.fullName
          ? student.fullName.toLowerCase().includes(searchTerm)
          : false;
        const emailMatches = student.email
          ? student.email.toLowerCase().includes(searchTerm)
          : false;
        const noteMatches = week.notes
          ? week.notes.toLowerCase().includes(searchTerm)
          : false;
        return nameMatches || emailMatches || noteMatches;
      }
      return array.filter(filterFunction);
    } else {
      return array;
    }
  }

  function filterWeeksByWeeksAgo(array: any[], numberOfWeeksAgo: number) {
    if (numberOfWeeksAgo >= 0) {
      const nowTimestamp = Date.now();
      const now = new Date(nowTimestamp);
      const dayOfWeek = now.getDay();
      const thisSundayTimestamp = now - dayOfWeek * 86400000;
      const chosenSundayTimestamp =
        thisSundayTimestamp - numberOfWeeksAgo * 604800000;
      const sunday = new Date(chosenSundayTimestamp);
      console.log('type of sunday: ', typeof sunday);
      console.log('sunday: ', sunday);
      const sundayText = dateObjectToText(sunday);
      function filterFunction(weekRecord) {
        return weekRecord.weekStarts === sundayText;
      }
      return array.filter(filterFunction);
    } else {
      return array;
    }
  }

  function filterWeeksByCoach(weeks: any[], coach) {
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

  function filterWeeksByCourse(weeks: any[], course) {
    if (course.recordId) {
      const courseRecordId = Number(course.recordId);
      return weeks.filter(
        (week) =>
          getCourseFromMembershipId(week.relatedMembership).recordId ===
          courseRecordId,
      );
    } else {
      return weeks;
    }
  }

  function filterWeeksByOnHold(weeks: any[]) {
    if (filterHoldWeeks > 0) {
      return weeks.filter((week) => !week.holdWeek);
    } else {
      return weeks;
    }
  }

  function filterWeeksByCoachless(weeks: any[]) {
    if (filterCoachless > 0 && !filterByCoach.recordId) {
      function filterFunction(week) {
        const coach = getCoachFromMembershipId(week.relatedMembership);
        return coach.recordId;
      }
      return weeks.filter(filterFunction);
    } else {
      return weeks;
    }
  }

  function filterWeeksByIncomplete(weeks: any[]) {
    if (filterIncomplete === 1) {
      return weeks.filter((week) => !week.recordsComplete);
    } else if (filterIncomplete === 2) {
      return weeks.filter((week) => week.recordsComplete);
    } else {
      return weeks;
    }
  }

  function combinedFilterWeeks(weeks) {
    const filteredBySearchTerm = filterWeeksBySearchTerm(weeks, searchTerm);
    const filteredByCoachless = filterWeeksByCoachless(filteredBySearchTerm);
    const filteredByWeeksAgo = filterWeeksByWeeksAgo(
      filteredByCoachless,
      filterByWeeksAgo,
    );
    const filteredByCoach = filterWeeksByCoach(
      filteredByWeeksAgo,
      filterByCoach,
    );
    const filteredByCourse = filterWeeksByCourse(
      filteredByCoach,
      filterByCourse,
    );
    const filteredByIncomplete = filterWeeksByIncomplete(filteredByCourse);
    const filteredByOnHold = filterWeeksByOnHold(filteredByIncomplete);
    function weekSorter(a, b) {
      const courseA = getCourseFromMembershipId(a.relatedMembership).name;
      const courseB = getCourseFromMembershipId(b.relatedMembership).name;
      if (courseA !== courseB) {
        return courseA > courseB ? 1 : -1;
      }
      if (
        getCoachFromMembershipId(a.relatedMembership).user &&
        getCoachFromMembershipId(b.relatedMembership).user
      ) {
        const coachA = getCoachFromMembershipId(a.relatedMembership).user.name;
        const coachB = getCoachFromMembershipId(b.relatedMembership).user.name;
        if (coachA !== coachB) {
          return coachA > coachB ? 1 : -1;
        }
      }
      const lessonA = getLessonFromRecordId(a.currentLesson);
      const lessonB = getLessonFromRecordId(b.currentLesson);
      if (lessonA.weekRef !== lessonB.weekRef) {
        return lessonA.weekRef - lessonB.weekRef;
      } else if (lessonA.lessonName !== lessonB.lessonName) {
        return lessonA.lessonName > lessonB.lessonName ? 1 : -1;
      }
      return 0;
    }
    filteredByOnHold.sort(weekSorter);
    return filteredByOnHold;
  }

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true;
      loadStartupData();
    }
  }, []);

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

  useEffect(() => {
    if (startupDataLoaded) {
      setWeeksToDisplay(combinedFilterWeeks(weekRecords.current));
    }
  }, [
    startupDataLoaded,
    searchTerm,
    filterByCoach,
    filterByCourse,
    filterByWeeksAgo,
    filterCoachless,
    filterHoldWeeks,
    filterIncomplete,
  ]);

  return (
    <div className="coaching">
      {!startupDataLoaded && <p>data is loading</p>}
      {startupDataLoaded && (
        <div>
          <CoachingFilter
            searchTerm={searchTerm}
            updateSearchTerm={updateSearchTerm}
            weeksToDisplay={weeksToDisplay}
            filterCoachless={filterCoachless}
            updateCoachlessFilter={updateCoachlessFilter}
            filterHoldWeeks={filterHoldWeeks}
            updateHoldFilter={updateHoldFilter}
            filterIncomplete={filterIncomplete}
            updateFilterIncomplete={updateFilterIncomplete}
            coaches={coaches.current}
            students={students.current}
            courses={courses.current}
            memberships={memberships.current}
            updateCoachFilter={updateCoachFilter}
            updateCourseFilter={updateCourseFilter}
            updateWeeksAgoFilter={updateWeeksAgoFilter}
          />
          <div>
            {/* Table */}
            {weeksToDisplay.length > 0 && (
              <StudentRecordsTable
                weeksToDisplay={weeksToDisplay}
                weekGetsPrivateCalls={weekGetsPrivateCalls}
                weekGetsGroupCalls={weekGetsGroupCalls}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
