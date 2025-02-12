import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import type { GroupSession, Week } from 'src/types/CoachingTypes';
import useGroupSessions from 'src/hooks/CoachingData/useGroupSessions';
import useGroupAttendees from 'src/hooks/CoachingData/useGroupAttendees';

import ContextualControlls from 'src/components/ContextualControlls';
import { useModal } from 'src/hooks/useModal';

import {
  CoachDropdown,
  DateInput,
  DeleteRecord,
  Dropdown,
  DropdownWithEditToggle,
  FormControls,
  TextAreaInput,
  TextInput,
} from '../../../general';

const sessionTypeOptions = [
  '1MC',
  '2MC',
  'Modules 1 & 2',
  'Level 1',
  'Level 2',
  'Level 3',
  'Level 4',
  'Level 5',
  'Level 6',
  'Module 3',
  'Module 4',
  'LCS Cohort',
  'Advanced',
  'Conversation',
];

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
  const { openModal, closeModal } = useModal();

  const {
    getAttendeesFromGroupSessionId,
    coachListQuery,
    lastThreeWeeksQuery,
    getStudentFromMembershipId,
    getMembershipFromWeekRecordId,
  } = useCoaching();
  const {
    groupSessionsTopicFieldOptionsQuery,
    createGroupSessionMutation,
    updateGroupSessionMutation,
  } = useGroupSessions();

  const { createGroupAttendeesMutation, deleteGroupAttendeesMutation } =
    useGroupAttendees();

  // Rendering
  const dataReady =
    coachListQuery.isSuccess && groupSessionsTopicFieldOptionsQuery.isSuccess;
  const rendered = useRef(false);

  // State management
  const [editMode, setEditMode] = useState<boolean>(!!newRecord);
  const recordId = useMemo(
    () => (newRecord ? -1 : groupSession.recordId),
    [newRecord, groupSession.recordId],
  );

  const [sessionType, setSessionType] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [coach, setCoach] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [callDocument, setCallDocument] = useState<string>('');
  const [zoomLink, setZoomLink] = useState<string>('');

  const [addingAttendee, setAddingAttendee] = useState<string>('');

  interface attendeeChangesObj {
    name: string;
    relatedWeek: number;
    action?: 'add' | 'remove';
  }
  const [attendees, setAttendees] = useState<attendeeChangesObj[]>([]);

  // Edit or Update State
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

    setAttendees(() => {
      if (newRecord) return [];
      const attendees = getAttendeesFromGroupSessionId(recordId);
      return attendees?.map((attendee) => ({
        name: attendee.weekStudent,
        relatedWeek: attendee.student,
      })) as attendeeChangesObj[];
    });
  }, [getAttendeesFromGroupSessionId, groupSession, newRecord, recordId]);

  function handleAddAttendee() {
    if (!addingAttendee) {
      console.error('No student selected');
      return;
    }
    const addingAttendeeWeekRecordId = Number.parseInt(addingAttendee);
    if (!addingAttendeeWeekRecordId) {
      console.error('Invalid student selected');
    }
    const student = getStudentFromMembershipId(
      getMembershipFromWeekRecordId(addingAttendeeWeekRecordId)?.recordId,
    );
    if (!student) {
      console.error('No student found with week recordId:', addingAttendee);
      return;
    }
    // if the student is already in the list, don't add it again
    if (attendees.find((attendee) => attendee.name === student.fullName)) {
      if (
        attendees.find((attendee) => attendee.name === student.fullName)
          ?.action === 'remove'
      ) {
        // if the student was previously removed, remove the 'remove' action
        setAttendees((prev) =>
          prev.map((attendee) =>
            attendee.name === student.fullName
              ? { ...attendee, action: undefined }
              : attendee,
          ),
        );
        return;
      }
      return;
    }
    // Add the new attendee to the list
    setAttendees((prev) => [
      ...prev,
      {
        name: student.fullName,
        relatedWeek: addingAttendeeWeekRecordId,
        action: 'add',
      },
    ]);
    setAddingAttendee('');
  }

  function handleRemoveAttendee(relatedWeek: number | string) {
    const recordId = Number.parseInt(relatedWeek as string);

    const attendeeToRemove = attendees.find(
      (attendee) => attendee.relatedWeek === recordId,
    );
    if (!attendeeToRemove) {
      console.error('No attendee found with week recordId:', recordId);
      return;
    }
    if (attendeeToRemove.action === 'add') {
      // remove the attendee from the list, if it was added in this session
      setAttendees((prev) =>
        prev.filter((attendee) => attendee.relatedWeek !== recordId),
      );
    } else {
      // set the action of the attendee to remove, since it was already in the list
      setAttendees((prev) =>
        prev.map((attendee) =>
          attendee.relatedWeek === recordId
            ? { ...attendee, action: 'remove' }
            : attendee,
        ),
      );
    }
  }

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
  //Helper funcs
  function checkAttendeeChanges() {
    // check if any attendees were added or removed
    return attendees.some(
      (attendee) =>
        attendee.action &&
        (attendee.action === 'add' || attendee.action === 'remove'),
    );
  }

  // Editing Functions

  function enableEditMode() {
    setEditMode(true);
    updateDisableClickOutside(true);
  }
  function disableEditMode() {
    setEditMode(false);
    updateDisableClickOutside(false);
  }

  function cancelEdit() {
    if (newRecord) {
      closeContextual();
      return;
    }
    disableEditMode();
    setInitialState();
  }
  function toggleEditMode() {
    if (editMode) {
      cancelEdit();
    } else {
      enableEditMode();
    }
  }
  function deleteRecordFunction() {
    console.error('Delete Record Function, not impletemented yet');
    closeModal();
    cancelEdit();
    closeContextual();
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
      createGroupSessionMutation.mutate(
        {
          date,
          coach,
          sessionType,
          topic,
          comments,
          callDocument,
          zoomLink,
        },
        {
          onSuccess: (data) => {
            const idsCreated = data as number[];
            // data will be an array of record ID's created
            if (idsCreated.length !== 1) {
              console.error('Error creating group session');
              return;
            }
            const newRecordId = idsCreated[0];
            // once it is created, add the attendees
            const attendeesToAdd = attendees.filter(
              (attendee) => attendee.action === 'add',
            );
            createGroupAttendeesMutation.mutate(
              attendeesToAdd.map((attendee) => ({
                groupSession: newRecordId,
                student: attendee.relatedWeek,
              })),
              {
                onSuccess: (data) => {
                  // data will be an array of record ID's created
                  if ((data as number[]).length !== attendeesToAdd.length) {
                    console.error('Error creating group attendees');
                    return;
                  }
                  closeContextual();
                },
                onError: (error) => {
                  console.error('Error creating group attendees', error);
                },
              },
            );
          },
        },
      );
      // IMPORTANT! must await the creation of the group session
    } else {
      // verify if any changes were made
      if (
        date === groupSession.date &&
        coach === groupSession.coach.email &&
        sessionType === groupSession.sessionType &&
        topic === groupSession.topic &&
        comments === groupSession.comments &&
        callDocument === groupSession.callDocument &&
        zoomLink === groupSession.zoomLink &&
        !checkAttendeeChanges()
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
      if (checkAttendeeChanges()) {
        const attendeesToAdd = attendees.filter(
          (attendee) => attendee.action === 'add',
        );
        const attendeesToRemove = attendees.filter(
          (attendee) => attendee.action === 'remove',
        );

        createGroupAttendeesMutation.mutate(
          attendeesToAdd.map((attendee) => ({
            groupSession: recordId,
            student: attendee.relatedWeek,
          })),
        );

        deleteGroupAttendeesMutation.mutate(
          attendeesToRemove.map((attendee) => ({
            groupSession: recordId,
            student: attendee.relatedWeek,
          })),
        );
      }
    }
    disableEditMode();
    closeContextual();
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
              <CoachDropdown
                coachEmail={coach}
                onChange={updateCoach}
                editMode={editMode}
              />
              {editMode && <DateInput value={date} onChange={setDate} />}
              {editMode && (
                <Dropdown
                  label="Session Type"
                  value={sessionType}
                  onChange={setSessionType}
                  options={sessionTypeOptions}
                />
              )}
            </div>
            <DropdownWithEditToggle
              value={topic}
              onChange={setTopic}
              editMode={editMode}
              options={groupSessionsTopicFieldOptionsQuery.data ?? []}
              label="Topic"
            />
            <TextAreaInput
              label="Comments"
              value={comments}
              onChange={setComments}
              editMode={editMode}
            />
            <TextInput
              label="Call Document"
              value={callDocument}
              onChange={setCallDocument}
              editMode={editMode}
            />
            <TextInput
              label="Zoom Link"
              value={zoomLink}
              onChange={setZoomLink}
              editMode={editMode}
            />
            {editMode && (
              <div className="lineWrapper">
                <label className="label" htmlFor="addAttendee">
                  Add Attendees:
                </label>
                <select
                  id="attendee"
                  name="attendee"
                  className="content"
                  value={addingAttendee}
                  onChange={(e) => setAddingAttendee(e.target.value)}
                >
                  <option value="">Select</option>
                  {lastThreeWeeksQuery.data
                    ?.filter((filterWeek) => {
                      return (
                        week.membershipCourseHasGroupCalls &&
                        filterWeek.weekStarts === week.weekStarts
                      );
                    })
                    .map((studentWeek) => (
                      <option
                        key={studentWeek.recordId}
                        value={studentWeek.recordId}
                      >
                        {
                          getStudentFromMembershipId(
                            studentWeek.relatedMembership,
                          )?.fullName
                        }
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="addButton addAttendee"
                  onClick={() => handleAddAttendee()}
                >
                  Add Attendee
                </button>
              </div>
            )}
            <div className="lineWrapper">
              <label className="label">Attendees:</label>
              <div className="content">
                {attendees &&
                  attendees.map(
                    (attendee) =>
                      // if attendee is to be removed, don't display it
                      attendee.action !== 'remove' && (
                        <div key={attendee.relatedWeek}>
                          <p> {attendee.name}</p>
                          <button
                            type="button"
                            className="redButton"
                            onClick={() =>
                              handleRemoveAttendee(attendee.relatedWeek)
                            }
                          >
                            Remove Attendee
                          </button>
                        </div>
                      ),
                  )}
              </div>
            </div>
            {editMode && !newRecord && (
              <DeleteRecord deleteFunction={deleteRecordFunction} />
            )}
            <FormControls
              editMode={editMode}
              cancelEdit={cancelEdit}
              captureSubmitForm={captureSubmitForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function GroupSessionsCell({
  week,
  groupSessions,
}: {
  week: Week;
  groupSessions: GroupSession[] | null;
}) {
  const { groupAttendeesQuery, groupSessionsQuery } = useCoaching();

  const dataReady =
    groupAttendeesQuery.isSuccess && groupSessionsQuery.isSuccess;
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
