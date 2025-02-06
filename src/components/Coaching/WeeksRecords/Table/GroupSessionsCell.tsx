import { useEffect, useMemo, useState } from 'react';

import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import type { GroupSession, Week } from 'src/types/CoachingTypes';
import useGroupSessions from 'src/hooks/CoachingData/useGroupSessions';

import ContextualControlls from 'src/components/ContextualControlls';

function GroupSessionCell({
  groupSession,
  newRecord,
}: {
  groupSession: GroupSession;
  newRecord?: boolean;
}) {
  const { contextual, openContextual, setContextualRef } = useContextualMenu();
  const { getAttendeesFromGroupSessionId, coachListQuery } = useCoaching();
  const { groupSessionsTopicFieldOptionsQuery } = useGroupSessions();

  const [sessionType, setSessionType] = useState<string>(
    newRecord ? '' : groupSession.sessionType,
  );
  const [date, setDate] = useState(
    groupSession.date
      ? typeof groupSession.date === 'string'
        ? groupSession.date
        : new Date(groupSession.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    // : new Date(groupSession.date).toISOString().split('T')[0],
  );
  const [coach, setCoach] = useState<string>(
    groupSession.coach ? groupSession.coach.email : '',
  );
  const coachName = useMemo(() => {
    const corrector = coachListQuery.data?.find(
      (user) => user.user.email === coach,
    );
    return corrector ? corrector.user.name : 'No Coach Found';
  }, [coach, coachListQuery.data]);
  const [topic, setTopic] = useState<string>(
    newRecord ? '' : groupSession.topic,
  );
  const [comments, setComments] = useState<string>(
    newRecord ? '' : groupSession.comments,
  );
  const [callDocument, setCallDocument] = useState<string>(
    newRecord ? '' : groupSession.callDocument,
  );
  const [zoomLink, setZoomLink] = useState<string>(
    newRecord ? '' : groupSession.zoomLink,
  );
  const [recordId, setRecordId] = useState<number>(
    newRecord ? -1 : groupSession.recordId,
  );

  const [attendees, setAttendees] = useState(
    newRecord
      ? []
      : getAttendeesFromGroupSessionId(recordId)?.map(
          (attendee) => attendee.weekStudent,
        ),
  );

  const [editMode, setEditMode] = useState<boolean>(!!newRecord);

  function updateCoach(email: string) {
    const corrector = coachListQuery.data?.find(
      (coach) => coach.user.email === email,
    );
    if (!corrector) {
      console.error('No coach found with email:', email);
      return;
    }
    setCoach(corrector.user.email);
  }
  return (
    <div className="cellWithContextual" key={recordId}>
      {newRecord ? (
        <button
          type="button"
          className="greenButton"
          onClick={() => openContextual(`groupSession${recordId}`)}
        >
          New
        </button>
      ) : (
        <button
          type="button"
          onClick={() => openContextual(`groupSession${recordId}`)}
        >
          {sessionType}
        </button>
      )}
      {contextual === `groupSession${recordId}` && (
        <div className="contextualWrapper">
          <div className="contextual" ref={setContextualRef}>
            <ContextualControlls />
            {editMode ? (
              newRecord ? (
                <h3>New Group Session</h3>
              ) : (
                <h3>Edit Group Session</h3>
              )
            ) : (
              <h3>{`Session: ${sessionType} on ${date}`}</h3>
            )}
            <div>
              <div className="lineWrapper">
                <label className="label" htmlFor="coach">
                  Coach:
                </label>
                {editMode ? (
                  <select
                    id="coach"
                    name="coach"
                    className="content"
                    defaultValue={coach}
                    onChange={(e) => updateCoach(e.target.value)}
                  >
                    <option value="">Select</option>

                    {coachListQuery.data?.map((coach) => (
                      <option key={coach.coach} value={coach.user.email}>
                        {coach.user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="content">{coachName}</p>
                )}
              </div>
              {editMode && (
                <div className="lineWrapper">
                  <label className="label">Date: </label>
                  <input
                    className="content"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              )}
              {editMode && (
                <div className="lineWrapper">
                  <label className="label" htmlFor="sessionType">
                    Session Type:
                  </label>
                  <select
                    id="sessionType"
                    name="sessionType"
                    className="content"
                    defaultValue={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="1MC">1MC</option>
                    <option value="2MC">2MC</option>
                    <option value="Modules 1 & 2">Modules 1 & 2</option>
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                    <option value="Level 4">Level 4</option>
                    <option value="Level 5">Level 5</option>
                    <option value="Level 6">Level 6</option>
                    <option value="Module 3">Module 3</option>
                    <option value="Module 4">Module 4</option>
                    <option value="LCS Cohort">LCS Cohort</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Conversation">Conversation</option>
                  </select>
                </div>
              )}
            </div>
            <div className="lineWrapper">
              <label className="label">Topic: </label>
              {editMode ? (
                <select
                  className="content"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="">Select</option>
                  {groupSessionsTopicFieldOptionsQuery.data?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="content">{topic}</p>
              )}
            </div>
            <div className="lineWrapper">
              <label className="label">Comments: </label>
              {editMode ? (
                <textarea
                  className="content"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              ) : (
                <p className="content">{comments}</p>
              )}
            </div>
            <div className="lineWrapper">
              <p className="label">Attendees: </p>
              <p className="content">
                {attendees &&
                  attendees.map((attendee) => <p key={attendee}>{attendee}</p>)}
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
              </p>
            </div>
            <div>
              {editMode ? (
                <>
                  <div className="lineWrapper">
                    <label className="label" htmlFor="callDocument">
                      Call Document:
                    </label>
                    <input
                      className="content"
                      id="callDocument"
                      name="callDocument"
                      type="text"
                      value={callDocument}
                      onChange={(e) => setCallDocument(e.target.value)}
                    />
                  </div>
                  <div className="lineWrapper">
                    <label className="label" htmlFor="zoomLink">
                      Zoom Link:
                    </label>
                    <input
                      className="content"
                      id="zoomLink"
                      name="zoomLink"
                      type="text"
                      value={zoomLink}
                      onChange={(e) => setZoomLink(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="lineWrapper">
                    <label className="label" htmlFor="callDocument">
                      Call Document:
                    </label>
                    <p className="content">{callDocument}</p>
                  </div>
                  <div className="lineWrapper">
                    <label className="label" htmlFor="zoomLink">
                      Zoom Link:
                    </label>
                    <p className="content">{zoomLink}</p>
                  </div>
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
  );
}

export default function GroupSessionsCell({ week }: { week: Week }) {
  const {
    groupAttendeesQuery,
    groupSessionsQuery,
    getGroupSessionsFromWeekRecordId,
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
    dataReady && (
      <>
        {groupSessions?.map((groupSession) => (
          <GroupSessionCell
            groupSession={groupSession}
            key={groupSession.recordId}
          />
        ))}
        {week.membershipCourseHasGroupCalls && (
          <GroupSessionCell
            groupSession={{ recordId: -1 } as GroupSession}
            newRecord
          />
        )}
      </>
    )
  );
}
