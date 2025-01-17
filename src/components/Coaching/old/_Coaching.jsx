// src/Coaching.jsx

import React, { useEffect, useRef, useState } from 'react';

import { useUserData } from '../../../hooks/UserData/useUserData';

import { useBackend } from '../../../hooks/useBackend';
import { useContextualMenu } from '../../../hooks/useContextualMenu';
// import './_styles.css';
const Coaching = () => {
  const { contextual, openContextual, closeContextual, currentContextual } =
    useContextualMenu;
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

  function updateSearchTerm(term) {
    setSearchTerm(term.toLowerCase());
  }

  function updateCoachFilter(coachId) {
    const coachToSet =
      coaches.current.find((coach) => coach.recordId === Number(coachId)) || {};
    setFilterByCoach(coachToSet);
  }

  function updateCourseFilter(courseId) {
    const courseToSet =
      courses.current.find((course) => course.recordId === Number(courseId)) ||
      {};
    setFilterByCourse(courseToSet);
  }

  function updateWeeksAgoFilter(weeksAgo) {
    setFilterByWeeksAgo(weeksAgo);
  }

  function updateCoachlessFilter(argument) {
    setFilterCoachless(Number.parseInt(argument));
  }

  function updateHoldFilter(argument) {
    setFilterHoldWeeks(Number.parseInt(argument));
  }

  function updateFilterIncomplete(argument) {
    setFilterIncomplete(Number.parseInt(argument));
  }

  function openMoreFilters() {
    openContextual('moreFilters');
  }

  function openStudentPopup(recordId) {
    openContextual(`student${recordId}`);
  }

  function openCallPopup(recordId) {
    openContextual(`call${recordId}`);
  }

  function openNewCallPopup(weekRecordId) {
    openContextual(`newCallForWeek${weekRecordId}`);
  }

  function openGroupSessionPopup(recordId) {
    currentAttendee.current = null;
    openContextual(`groupSession${recordId}`);
  }

  function openAttendeePopup(recordId) {
    openContextual(`attendee${recordId}`);
  }

  function openAssignmentPopup(recordId) {
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

  function dateObjectToText(dateObject) {
    function formatMonth(date) {
      const unformattedMonth = date.getMonth() + 1;
      return unformattedMonth < 10
        ? `0${unformattedMonth}`
        : `${unformattedMonth}`;
    }
    function formatDate(date) {
      let dateString = date.getDate().toString();
      if (Number(dateString) < 10) {
        dateString = `0${dateString}`;
      }
      return dateString;
    }

    function formatYear(date) {
      return date.getFullYear().toString();
    }
    return `${formatYear(dateObject)}-${formatMonth(dateObject)}-${formatDate(dateObject)}`;
  }

  function getStudentFromMembershipId(membershipId) {
    const membership =
      memberships.current.find((item) => item.recordId === membershipId) || {};
    const studentId = membership.relatedStudent;
    return students.current.find((item) => item.recordId === studentId) || {};
  }

  function getCoachFromMembershipId(membershipId) {
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

  function getCourseFromMembershipId(membershipId) {
    const membership =
      memberships.current.find((item) => item.recordId === membershipId) || {};
    const courseId = membership.relatedCourse;
    return courses.current.find((item) => item.recordId === courseId) || {};
  }

  function getLessonFromRecordId(lessonId) {
    return lessons.current.find((item) => item.recordId === lessonId) || {};
  }

  function getPrivateCallsFromWeekId(weekId) {
    return privateCalls.current.filter((call) => call.relatedWeek === weekId);
  }

  function getGroupSessionsFromWeekId(weekId) {
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

  function getAttendeeWeeksFromGroupSessionId(sessionId) {
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

  function getAssignmentsFromWeekId(weekId) {
    return assignments.current.filter(
      (assignment) => assignment.relatedWeek === weekId,
    );
  }

  function getMembershipFromWeekId(weekId) {
    const week =
      weekRecords.current.find((week) => week.recordId === weekId) || {};
    const membershipId = week.relatedMembership;
    return memberships.current.find(
      (membership) => membership.recordId === membershipId,
    );
  }

  function weekGetsPrivateCalls(weekId) {
    const membership = getMembershipFromWeekId(weekId);
    const course = getCourseFromMembershipId(membership.recordId);
    return course.weeklyPrivateCalls > 0;
  }

  function weekGetsGroupCalls(weekId) {
    const membership = getMembershipFromWeekId(weekId);
    const course = getCourseFromMembershipId(membership.recordId);
    return course.hasGroupCalls;
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

  function makeCourseSelector() {
    const courseSelector = [
      <option key={0} value={0}>
        All Courses
      </option>,
    ];
    courses.current.forEach((course) => {
      const courseHasActiveMembership =
        memberships.current.filter(
          (item) => item.relatedCourse === course.recordId,
        ).length > 0;
      if (courseHasActiveMembership) {
        courseSelector.push(
          <option key={course.recordId} value={course.recordId}>
            {course.name}
          </option>,
        );
      }
    });
    return courseSelector;
  }

  function filterWeeksBySearchTerm(array, searchTerm) {
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

  function filterWeeksByWeeksAgo(array, numberOfWeeksAgo) {
    if (numberOfWeeksAgo >= 0) {
      const nowTimestamp = Date.now();
      const now = new Date(nowTimestamp);
      const dayOfWeek = now.getDay();
      const thisSundayTimestamp = now - dayOfWeek * 86400000;
      const chosenSundayTimestamp =
        thisSundayTimestamp - numberOfWeeksAgo * 604800000;
      const sunday = new Date(chosenSundayTimestamp);
      const sundayText = dateObjectToText(sunday);
      function filterFunction(weekRecord) {
        return weekRecord.weekStarts === sundayText;
      }
      return array.filter(filterFunction);
    } else {
      return array;
    }
  }

  function filterWeeksByCoach(weeks, coach) {
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

  function filterWeeksByCourse(weeks, course) {
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

  function filterWeeksByOnHold(weeks) {
    if (filterHoldWeeks > 0) {
      return weeks.filter((week) => !week.holdWeek);
    } else {
      return weeks;
    }
  }

  function filterWeeksByCoachless(weeks) {
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

  function filterWeeksByIncomplete(weeks) {
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

  const TableHeaderRow = () => (
    <tr className="tableHeader">
      <th>Student</th>
      {weeksToDisplay.filter((item) => weekGetsPrivateCalls(item.recordId))
        .length > 0 && <th>Private Calls</th>}
      {weeksToDisplay.filter((item) => weekGetsGroupCalls(item.recordId))
        .length > 0 && <th>Group Calls</th>}
      <th>Assignments</th>
      <th>Notes</th>
      <th>Lesson</th>
    </tr>
  );

  const Student = ({ week }) => {
    const student = getStudentFromMembershipId(week.relatedMembership);
    const currentMemberships = memberships.current.filter(
      (membership) => membership.relatedStudent === student.recordId,
    );
    return (
      <div>
        <div
          className="studentBox"
          onClick={
            student.recordId ? () => openStudentPopup(student.recordId) : null
          }
        >
          <strong>{student.fullName}</strong>
          <br />
          {student.email}
          <br />
          {!filterByCoach.recordId &&
            (student.primaryCoach ? student.primaryCoach.name : 'No Coach')}
          {!filterByCoach.recordId && <br />}
          {!filterByCourse.recordId &&
            (getCourseFromMembershipId(week.relatedMembership)
              ? getCourseFromMembershipId(week.relatedMembership).name
              : 'No Course')}
          {!filterByCourse.recordId && <br />}
          {filterByWeeksAgo < 0 && week.weekStarts}
        </div>
        {contextual === `student${student.recordId}` && student.recordId && (
          <div className="studentPopup" ref={currentContextual}>
            <h4>{student.fullName}</h4>
            <p>
              Email:
              {student.email}
            </p>
            {student.primaryCoach.id && (
              <p>
                {' '}
                Primary Coach:
                {student.primaryCoach.name}
              </p>
            )}
            <h5>Active Memberships:</h5>
            {currentMemberships.map((membership) => (
              <p key={membership.recordId}>
                {getCourseFromMembershipId(membership.recordId).name} since{' '}
                {membership.startDate}
                {membership.onHold ? ', currently on Hold.' : '.'}
              </p>
            ))}
            {student.fluencyGoal.length > 1 && <h5>Fluency Goal:</h5>}
            {student.fluencyGoal.length > 1 && <p>{student.fluencyGoal}</p>}
            {student.startingLevel.length > 1 && <h5>Starting Level:</h5>}
            {student.startingLevel.length > 1 && <p>{student.startingLevel}</p>}
            <div className="buttonBox">
              <button
                type="button"
                className="redButton"
                onClick={closeContextual}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Calls = ({ data }) => {
    const callData = getPrivateCallsFromWeekId(data.recordId);
    const callPopups = (data) => {
      if (data.length === 0) {
        return null;
      } else {
        return data.map((call) => (
          <div className="assignmentBox" key={call.recordId}>
            <button type="button" onClick={() => openCallPopup(call.recordId)}>
              {call.rating}
            </button>
            {contextual === `call${call.recordId}` && (
              <div className="callPopup" ref={currentContextual}>
                <h4>
                  {
                    getStudentFromMembershipId(
                      getMembershipFromWeekId(call.relatedWeek).recordId,
                    ).fullName
                  }{' '}
                  on {call.date}
                </h4>
                <p>
                  Rating:
                  {call.rating}
                </p>
                <p>
                  Notes:
                  {call.notes}
                </p>
                <p>
                  Difficulties:
                  {call.areasOfDifficulty}
                </p>
                {call.recording.length > 0 && (
                  <a target="_blank" href={call.recording}>
                    Recording Link
                  </a>
                )}
                <div className="buttonBox">
                  <button
                    type="button"
                    className="redButton"
                    onClick={closeContextual}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        ));
      }
    };
    return (
      <div className="callBox">
        {callPopups(callData)}
        {weekGetsPrivateCalls(data.recordId) && (
          <button
            type="button"
            className="greenButton"
            onClick={() => openNewCallPopup(data.recordId)}
          >
            New
          </button>
        )}
        {contextual === `newCallForWeek${data.recordId}` && (
          <div className="callPopup" ref={currentContextual}>
            <h4>
              {
                getStudentFromMembershipId(
                  getMembershipFromWeekId(data.recordId).recordId,
                ).fullName
              }{' '}
              {
                getCourseFromMembershipId(
                  getMembershipFromWeekId(data.recordId).recordId,
                ).name
              }{' '}
              call on {dateObjectToText(new Date(Date.now()))}
            </h4>
            <label htmlFor="start">Start date:</label>
            <input
              type="date"
              id="start"
              name="trip-start"
              value={dateObjectToText(new Date(Date.now()))}
              min="2018-01-01"
              max="2026-12-31"
            />
            <p>Rating:</p>
            <select value="Fair">
              <option value="Terrible">Terrible</option>
              <option value="Poor">Poor</option>
              <option value="Fair">Fair</option>
              <option value="Good">Good</option>
              <option value="Very Good">Very Good</option>
              <option value="Excellent">Excellent</option>
              <option value="Late Cancel">Late Cancel</option>
              <option value="No-Show">No-Show</option>
            </select>
            <p>Notes:</p>
            <textarea />
            <p>Difficulties:</p>
            <textarea />
            <p>Recording Link</p>
            <textarea />
            <div className="buttonBox">
              <button
                type="button"
                className="greenButton"
                onClick={closeContextual}
              >
                Submit
              </button>
            </div>
            <div className="buttonBox">
              <button
                type="button"
                className="redButton"
                onClick={closeContextual}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const GroupSessions = ({ data }) => {
    if (data.length === 0) {
      return null;
    } else {
      function changeAttendee(attendeeId, groupSessionId) {
        currentAttendee.current =
          students.current.find((student) => student.recordId === attendeeId) ||
          {};
        openAttendeePopup(`${attendeeId}-${groupSessionId}`);
      }
      return data.map((groupSession) => (
        <div className="assignmentBox" key={groupSession.recordId}>
          <button
            type="button"
            onClick={() => openGroupSessionPopup(groupSession.recordId)}
          >
            {groupSession.sessionType}
          </button>
          {contextual === `groupSession${groupSession.recordId}` && (
            <div className="groupSessionPopup" ref={currentContextual}>
              <h4>
                {groupSession.sessionType} on
                {groupSession.date}
              </h4>
              <p>
                Coach:
                {groupSession.coach ? groupSession.coach.name : ''}
              </p>
              <p>
                Topic:
                {groupSession.topic}
              </p>
              <p>
                Comments:
                {groupSession.comments}
              </p>
              <p>
                <strong>Attendees:</strong>
              </p>
              <div className="groupAttendeeList">
                {getAttendeeWeeksFromGroupSessionId(groupSession.recordId).map(
                  (attendee) => (
                    <button
                      type="button"
                      key={attendee.recordId}
                      className="groupAttendee"
                      onClick={() =>
                        changeAttendee(
                          getStudentFromMembershipId(attendee.relatedMembership)
                            .recordId,
                          groupSession.recordId,
                        )
                      }
                    >
                      {
                        getStudentFromMembershipId(attendee.relatedMembership)
                          .fullName
                      }
                    </button>
                  ),
                )}
              </div>
              {(groupSession.callDocument
                ? groupSession.callDocument.length > 0
                : false) && (
                <p>
                  <a target="_blank" href={groupSession.callDocument}>
                    Call Document
                  </a>
                </p>
              )}
              {(groupSession.zoomLink
                ? groupSession.zoomLink.length > 0
                : false) && (
                <p>
                  <a target="_blank" href={groupSession.zoomLink}>
                    Recording Link
                  </a>
                </p>
              )}
              <div className="buttonBox">
                <button
                  type="button"
                  className="redButton"
                  onClick={closeContextual}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {contextual ===
            `attendee${
              currentAttendee.current
                ? currentAttendee.current.recordId
                : undefined
            }-${groupSession.recordId}` && (
            <div className="studentPopup" ref={currentContextual}>
              <h4>{currentAttendee.current.fullName}</h4>
              <p>{currentAttendee.current.email}</p>
              <p>
                {' '}
                Primary Coach:
                {currentAttendee.current.primaryCoach.name}
              </p>
              <h5>Fluency Goal:</h5>
              <p>{currentAttendee.current.fluencyGoal}</p>
              <h5>Starting Level:</h5>
              <p>{currentAttendee.current.startingLevel}</p>
              <div className="buttonBox">
                <button
                  type="button"
                  className="redButton"
                  onClick={() => openGroupSessionPopup(groupSession.recordId)}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      ));
    }
  };

  const Assignments = ({ data }) => {
    if (data.length === 0) {
      return null;
    } else {
      return data.map((assignment) => (
        <div className="assignmentBox" key={assignment.recordId}>
          <button
            type="button"
            onClick={() => openAssignmentPopup(assignment.recordId)}
          >
            {assignment.assignmentType}:{assignment.rating}
          </button>
          {contextual === `assignment${assignment.recordId}` && (
            <div className="assignmentPopup" ref={currentContextual}>
              <h4>
                {assignment.assignmentType} by{' '}
                {
                  getStudentFromMembershipId(
                    getMembershipFromWeekId(assignment.relatedWeek).recordId,
                  ).fullName
                }
              </h4>
              <p>{assignment.date}</p>
              {assignment.homeworkCorrector && (
                <p>
                  Corrected by
                  {assignment.homeworkCorrector.name}
                </p>
              )}
              <p>
                Rating:
                {assignment.rating}
              </p>
              <p>
                Notes:
                {assignment.notes}
              </p>
              <p>
                Areas of Difficulty:
                {assignment.areasOfDifficulty}
              </p>
              {(assignment.assignmentLink
                ? assignment.assignmentLink.length > 0
                : false) && (
                <a target="_blank" href={assignment.assignmentLink}>
                  Assignment Link
                </a>
              )}
              <div className="buttonBox">
                <button
                  type="button"
                  className="redButton"
                  onClick={closeContextual}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      ));
    }
  };

  const TableRow = ({ data }) =>
    data.map((item) => (
      <tr key={item.recordId} className="studentWeek">
        <td className="studentHeader">
          <Student week={item} />
        </td>
        {weeksToDisplay.filter((item) => weekGetsPrivateCalls(item.recordId))
          .length > 0 && (
          <td>
            <Calls data={item} />
          </td>
        )}
        {weeksToDisplay.filter((item) => weekGetsGroupCalls(item.recordId))
          .length > 0 && (
          <td>
            <GroupSessions data={getGroupSessionsFromWeekId(data.recordId)} />
          </td>
        )}
        <td>
          <Assignments data={getAssignmentsFromWeekId(item.recordId)} />
        </td>
        <td className="studentWeekNotes">{item.notes}</td>
        <td className="studentWeekNotes">
          {getLessonFromRecordId(item.currentLesson).lessonName}
        </td>
      </tr>
    ));

  const DisplayWeeks = ({ data }) => (
    <table className="studentRecords">
      <thead>
        <TableHeaderRow />
      </thead>
      <tbody>
        <TableRow data={data} />
      </tbody>
    </table>
  );

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
          <div className="coachingFilterSection">
            <div className="numberShowing">
              <h4>Search:</h4>
            </div>
            <div className="searchOrButton">
              <input
                className="weekSearch"
                type="text"
                value={searchTerm}
                onChange={(e) => updateSearchTerm(e.target.value)}
              />
            </div>
            <div className="searchOrButton">
              <button
                type="button"
                className="moreFiltersButton"
                onClick={openMoreFilters}
              >
                More Filters
              </button>
            </div>
            <div className="numberShowing">
              <h4>
                Showing:
                {weeksToDisplay.length} records
              </h4>
            </div>
            {contextual === 'moreFilters' && (
              <div className="moreFilters" ref={currentContextual}>
                <div className="coachingFilterSection">
                  <select
                    value={filterCoachless}
                    onChange={(e) => updateCoachlessFilter(e.target.value)}
                  >
                    <option value={1}>
                      Don't show students without coaches
                    </option>
                    <option value={0}>Show students without coaches</option>
                  </select>
                </div>
                <div className="coachingFilterSection">
                  <select
                    value={filterHoldWeeks}
                    onChange={(e) => updateHoldFilter(e.target.value)}
                  >
                    <option value={1}>Don't show weeks on hold</option>
                    <option value={0}>Show weeks on hold</option>
                  </select>
                </div>
                <div className="coachingFilterSection">
                  <select
                    value={filterIncomplete}
                    onChange={(e) => updateFilterIncomplete(e.target.value)}
                  >
                    <option value={0}>All records</option>
                    <option value={1}>Incomplete only</option>
                    <option value={2}>Complete only</option>
                  </select>
                </div>
                <div className="buttonBox">
                  <button
                    type="button"
                    className="redButton"
                    onClick={closeContextual}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="coachingFilterSection">
            <select onChange={(e) => updateCoachFilter(e.target.value)}>
              {makeCoachSelector()}
            </select>
            <select onChange={(e) => updateCourseFilter(e.target.value)}>
              {makeCourseSelector()}
            </select>
            <select onChange={(e) => updateWeeksAgoFilter(e.target.value)}>
              <option value={0}>This Week</option>
              <option value={1}>Last Week</option>
              <option value={2}>Two Weeks Ago</option>
              <option value={-1}>Last Three Weeks (All)</option>
            </select>
          </div>
          <div>
            {weeksToDisplay.length > 0 && (
              <DisplayWeeks data={weeksToDisplay} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Coaching;
