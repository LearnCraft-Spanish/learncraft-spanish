import type { GroupSession, GroupAttendees, Week } from './../../CoachingTypes';
import { useContextualMenu } from '../../../../hooks/useContextualMenu';
import useCoaching from '../../../../hooks/useCoaching';
import { useEffect, useState } from 'react';
import ContextualControlls from '../../../ContextualControlls';
export default function GroupSessionsCell({ week }: { week: Week }) {
  const { contextual, openContextual, closeContextual, setContextualRef } =
    useContextualMenu();
  const {
    getAttendeeWeeksFromGroupSessionId,
    groupAttendeesQuery,
    groupSessionsQuery,
  } = useCoaching();

  const [groupSessions, setGroupSessions] = useState<
    GroupSession[] | undefined
  >();

  const groupSessionTitle = `Session: `;
  const dataReady =
    groupAttendeesQuery.isSuccess && groupSessionsQuery.isSuccess;

  // There should only be one group session per week record?
  function getGroupSessionFromWeekRecordId(weekRecordId: number) {
    if (!groupAttendeesQuery.isSuccess || !groupSessionsQuery.isSuccess) {
      return null;
    }
    const attendeeList = groupAttendeesQuery.data.filter(
      (attendee) => attendee.student === weekRecordId,
    );
    const groupSessionList = groupSessionsQuery.data.filter((groupSession) =>
      attendeeList.find(
        (attendee) => attendee.groupSession === groupSession.recordId,
      ),
    );
    return groupSessionList;
  }

  function getAttendeesFromGroupSessionId(sessionId: number) {
    if (!groupAttendeesQuery.isSuccess || !groupSessionsQuery.isSuccess) {
      return null;
    }
    return groupAttendeesQuery.data.filter(
      (attendee) => attendee.groupSession === sessionId,
    );
  }

  useEffect(() => {
    if (dataReady && !groupSessions) {
      const groupSessions = getGroupSessionFromWeekRecordId(week.recordId);
      if (groupSessions && groupSessions.length > 0) {
        setGroupSessions(groupSessions);
      } else {
        console.error(
          `Group Session related to week recordId: ${week.recordId} not found`,
        );
      }
    }
  }, [dataReady, groupSessions, week.recordId]);
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
                  </p>{' '}
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
                <p className="content groupAttendeeList">
                  {getAttendeesFromGroupSessionId(groupSession.recordId)?.map(
                    (attendee) =>
                      attendee.weekStudent ? (
                        <p className="groupAttendee">{attendee.weekStudent}</p>
                      ) : (
                        'no student found'
                      ),
                  )}
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
                </p>
              </div>
              <div>
                <h4>Attendees:</h4>
                <div className="groupAttendeeList">
                  {getAttendeesFromGroupSessionId(groupSession.recordId)?.map(
                    (attendee) =>
                      attendee.weekStudent ? (
                        <p>{attendee.weekStudent},</p>
                      ) : (
                        'no student found'
                      ),
                  )}
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
                    <h4>Session Resources:</h4>
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
              {/* <div className="buttonBox">
                <button
                  type="button"
                  className="redButton"
                  onClick={closeContextual}
                >
                  Close
                </button>
              </div> */}
            </div>
          </div>
        )}
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
