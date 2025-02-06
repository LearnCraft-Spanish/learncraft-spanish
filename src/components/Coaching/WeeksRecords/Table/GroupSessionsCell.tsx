import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import type { GroupSession, Week } from 'src/types/CoachingTypes';
import useGroupSessions from 'src/hooks/CoachingData/useGroupSessions';

import ContextualControlls from 'src/components/ContextualControlls';
import { useModal } from 'src/hooks/useModal';

function GroupSessionCell({
  groupSession,
  week,
  newRecord,
}: {
  groupSession: GroupSession;
  week: Week;
  newRecord?: boolean;
}) {
  const {
    contextual,
    openContextual,
    setContextualRef,
    closeContextual,
    updateDisableClickOutside,
  } = useContextualMenu();
  const { openModal } = useModal();

  const {
    getAttendeesFromGroupSessionId,
    coachListQuery,
    lastThreeWeeksQuery,
    getStudentFromMembershipId,
  } = useCoaching();
  const {
    groupSessionsTopicFieldOptionsQuery,
    createGroupSessionMutation,
    updateGroupSessionMutation,
  } = useGroupSessions();

  const dataReady =
    coachListQuery.isSuccess && groupSessionsTopicFieldOptionsQuery.isSuccess;
  const rendered = useRef(false);

  const [sessionType, setSessionType] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [coach, setCoach] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [callDocument, setCallDocument] = useState<string>('');
  const [zoomLink, setZoomLink] = useState<string>('');

  const coachName = useMemo(() => {
    const corrector = coachListQuery.data?.find(
      (user) => user.user.email === coach,
    );
    return corrector ? corrector.user.name : 'No Coach Found';
  }, [coach, coachListQuery.data]);

  const recordId = useMemo(
    () => (newRecord ? -1 : groupSession.recordId),
    [newRecord, groupSession.recordId],
  );

  const attendees = useMemo(
    () =>
      newRecord
        ? []
        : getAttendeesFromGroupSessionId(recordId)?.map(
            (attendee) => attendee.weekStudent,
          ),
    [newRecord, getAttendeesFromGroupSessionId, recordId],
  );
  // interface attendeeChanges {
  //   name: string;
  //   relatedWeek: number;
  //   action: 'add' | 'remove';
  // }
  // const [attendeeChanges, setAttendeeChanges ] = useState<attendeeChanges[]>([]);

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
  function enableEditMode() {
    setEditMode(true);
    updateDisableClickOutside(true);
  }
  function disableEditMode() {
    setEditMode(false);
    updateDisableClickOutside(false);
  }

  const setInitialState = useCallback(() => {
    setSessionType(newRecord ? '' : groupSession.sessionType);
    setDate(
      groupSession.date
        ? typeof groupSession.date === 'string'
          ? groupSession.date
          : new Date(groupSession.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    );
    setCoach(newRecord ? '' : groupSession.coach.email);
    setTopic(newRecord ? '' : groupSession.topic);
    setComments(newRecord ? '' : groupSession.comments);
    setCallDocument(newRecord ? '' : groupSession.callDocument);
    setZoomLink(newRecord ? '' : groupSession.zoomLink);
  }, [groupSession, newRecord]);

  function cancelEdit() {
    if (newRecord) {
      closeContextual();
      return;
    }
    disableEditMode();
    setInitialState();
  }
  function captureSubmitForm() {
    // verify required fields
    if (!date || !coach || !sessionType) {
      openModal({
        type: 'error',
        title: 'Error',
        body: 'Date, Coach and Session Type are required',
      });
      return;
    }
    if (newRecord) {
      createGroupSessionMutation.mutate({
        date,
        coach,
        sessionType,
        topic,
        comments,
        callDocument,
        zoomLink,
      });
    } else {
      // verify if any changes were made
      if (
        date === groupSession.date &&
        coach === groupSession.coach.email &&
        sessionType === groupSession.sessionType &&
        topic === groupSession.topic &&
        comments === groupSession.comments &&
        callDocument === groupSession.callDocument &&
        zoomLink === groupSession.zoomLink
      ) {
        console.error('No changes detected');
        disableEditMode();
        return;
      }
      updateGroupSessionMutation.mutate({
        recordId,
        date,
        coach,
        sessionType,
        topic,
        comments,
        callDocument,
        zoomLink,
      });
    }
    disableEditMode();
    closeContextual();
  }

  function toggleEditMode() {
    if (editMode) {
      cancelEdit();
    } else {
      enableEditMode();
    }
  }

  useEffect(() => {
    if (dataReady && !rendered.current) {
      setInitialState();
      rendered.current = true;
    }
  }, [dataReady, sessionType, setInitialState]);

  return (
    <div className="cellWithContextual" key={recordId}>
      {newRecord ? (
        <button
          type="button"
          className="greenButton"
          onClick={() =>
            openContextual(`groupSession${recordId}week${week.recordId}`)
          }
        >
          New
        </button>
      ) : (
        <button
          type="button"
          onClick={() =>
            openContextual(`groupSession${recordId}week${week.recordId}`)
          }
        >
          {sessionType}
        </button>
      )}
      {contextual === `groupSession${recordId}week${week.recordId}` && (
        <div className="contextualWrapper">
          <div className="contextual" ref={setContextualRef}>
            <ContextualControlls editFunction={toggleEditMode} />
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
              <label className="label">Attendees:</label>
              <div className="content">
                {attendees &&
                  attendees.map((attendee) => <p key={attendee}>{attendee}</p>)}
                {/* <button
                  type="button"
                  className="addButton addAttendee"
                  onClick={() => openContextual(`groupSession${recordId}addAttendee`)}
                >
                  Add Attendee
                </button> */}
              </div>
            </div>
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
            <div className="lineWrapper">
              <label className="label" htmlFor="callDocument">
                Call Document:
              </label>
              {editMode ? (
                <input
                  className="content"
                  id="callDocument"
                  name="callDocument"
                  type="text"
                  value={callDocument}
                  onChange={(e) => setCallDocument(e.target.value)}
                />
              ) : (
                <p className="content">{callDocument}</p>
              )}
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="zoomLink">
                Zoom Link:
              </label>
              {editMode ? (
                <input
                  className="content"
                  id="zoomLink"
                  name="zoomLink"
                  type="text"
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                />
              ) : (
                <p className="content">{zoomLink}</p>
              )}
            </div>

            {editMode && (
              <div className="buttonBox">
                <button
                  type="button"
                  className="redButton"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="greenButton"
                  onClick={captureSubmitForm}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {contextual === `groupSession${recordId}addAttendee` && (
        <div className="contextualWrapper">
          <div className="contextual" ref={setContextualRef}>
            <h3>Add Attendee</h3>
            <div className="lineWrapper">
              <label className="label" htmlFor="attendee">
                Select Attendee:
              </label>
              <select
                id="attendee"
                name="attendee"
                className="content"
                defaultValue=""
              >
                <option value="">Select</option>
                {lastThreeWeeksQuery.data
                  ?.filter((filterWeek) => {
                    return (
                      week.membershipCourseHasGroupCalls &&
                      filterWeek.weekStarts === week.weekStarts
                    );
                  })
                  .map((week) => (
                    <option key={week.recordId} value={week.recordId}>
                      {
                        getStudentFromMembershipId(week.relatedMembership)
                          ?.fullName
                      }
                    </option>
                  ))}
              </select>
            </div>
            <div className="buttonBox">
              <button
                type="button"
                className="greenButton"
                onClick={() => openContextual(`groupSession${recordId}`)}
              >
                Add
              </button>
              <button
                type="button"
                className="redButton"
                onClick={() => openContextual(`groupSession${recordId}`)}
              >
                Cancel
              </button>
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
            week={week}
          />
        ))}
        {week.membershipCourseHasGroupCalls && (
          <GroupSessionCell
            groupSession={{ recordId: -1 } as GroupSession}
            newRecord
            week={week}
          />
        )}
      </>
    )
  );
}
