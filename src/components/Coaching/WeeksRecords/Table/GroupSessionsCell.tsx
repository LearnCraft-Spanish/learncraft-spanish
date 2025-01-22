import { useEffect, useState } from 'react';

import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import type { GroupSession, Week } from 'src/types/CoachingTypes';

import ContextualControlls from 'src/components/ContextualControlls';

export default function GroupSessionsCell({ week }: { week: Week }) {
  const { contextual, openContextual, setContextualRef } = useContextualMenu();
  const {
    groupAttendeesQuery,
    groupSessionsQuery,
    getGroupSessionsFromWeekRecordId,
    getAttendeesFromGroupSessionId,
  } = useCoaching();

  const [groupSessions, setGroupSessions] = useState<
    GroupSession[] | undefined
  >();

  const dataReady =
    groupAttendeesQuery.isSuccess && groupSessionsQuery.isSuccess;

  useEffect(() => {
    if (dataReady && !groupSessions) {
      const groupSessions = getGroupSessionsFromWeekRecordId(week.recordId);
      if (groupSessions && groupSessions.length > 0) {
        setGroupSessions(groupSessions);
      } else {
        console.error(
          `Group Session related to week recordId: ${week.recordId} not found`,
        );
      }
    }
  }, [
    dataReady,
    getGroupSessionsFromWeekRecordId,
    groupSessions,
    week.recordId,
  ]);
  return (
    dataReady &&
    groupSessions?.map((groupSession) => (
      <div className="cellWithContextual" key={groupSession.recordId}>
        <button
          type="button"
          onClick={() =>
            openContextual(
              `groupSession${groupSession.recordId}week${week.recordId}`,
            )
          }
        >
          {groupSession.sessionType}
        </button>
        {contextual ===
          `groupSession${groupSession.recordId}week${week.recordId}` && (
          <div className="contextualWrapper">
            <div className="contextual" ref={setContextualRef}>
              <ContextualControlls />
              <h3>
                {`Session: ${groupSession.sessionType} on 
                ${
                  typeof groupSession.date === 'string'
                    ? groupSession.date
                    : groupSession.date.toDateString()
                }`}
              </h3>
              <div>
                <div className="lineWrapper">
                  <p className="label">Coach: </p>
                  <p className="content">
                    {groupSession.coach
                      ? groupSession.coach.name
                      : 'No Coach Found'}
                  </p>
                </div>
              </div>
              <div className="lineWrapper">
                <p className="label">Topic: </p>
                <p className="content">{groupSession.topic}</p>
              </div>
              <div className="lineWrapper">
                <p className="label">Comments: </p>
                <p className="content">{groupSession.comments}</p>
              </div>
              <div className="lineWrapper">
                <p className="label">Attendees: </p>
                <div className="groupAttendeeList">
                  {getAttendeesFromGroupSessionId(groupSession.recordId)?.map(
                    (attendee) =>
                      attendee.weekStudent && (
                        <p
                          className="groupAttendee content"
                          key={`groupAttendee${attendee.weekStudent}`}
                        >
                          {attendee.weekStudent}
                        </p>
                      ),
                  )}
                  {/*
                  Popup button trigger for the student profile popup commented out at EOF
                  CURRENT STATUS: Replaced with studentName text above
                   */}
                  {/*
                {attendeesWeekRecords &&
                  attendeesWeekRecords.map(
                    (attendee: Week | undefined) =>
                      // <button
                      //   type="button"
                      //   key={attendee.recordId}
                      //   className="groupAttendee"
                      //   onClick={() =>
                      //     changeAttendee(
                      //       getStudentFromMembershipId(attendee.relatedMembership)
                      //         .recordId,
                      //       groupSession.recordId,
                      //     )
                      //   }
                      // >
                      attendee ? attendee.student : 'No Student Found',

                    // getStudentFromMembershipId(attendee.relatedMembership)
                    //   ? getStudentFromMembershipId(attendee.relatedMembership)
                    //       .fullName
                    //   : 'No Student Found',
                    // </button>
                  )}
                  */}
                </div>
              </div>
              <div>
                {(groupSession.callDocument || groupSession.zoomLink) && (
                  <>
                    <div className="lineWrapper">
                      <h4>Session Documents:</h4>
                    </div>
                    {groupSession.callDocument &&
                      groupSession.callDocument.length > 0 && (
                        <p>
                          <a target="_blank" href={groupSession.callDocument}>
                            Call Document
                          </a>
                        </p>
                      )}
                    {groupSession.zoomLink &&
                      groupSession.zoomLink.length > 0 && (
                        <p>
                          <a target="_blank" href={groupSession.zoomLink}>
                            Recording Link
                          </a>
                        </p>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Popup for viewing a student, maybe put somewhere else? make component, then let it be activated from here? */}
        {/* {contextual ===
        `attendee${
          currentAttendee.current ? currentAttendee.current.recordId : undefined
        }-${groupSession.recordId}` &&
        currentAttendee.current && (
          <div className="studentPopup" ref={setContextualRef}>
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
        )} */}
      </div>
    ))
  );
}
