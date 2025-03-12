import type { GroupSession, Week } from 'src/types/CoachingTypes';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CustomGroupAttendeeSelector from 'src/components/Coaching/general/CustomGroupAttendeeSelector';
import getWeekEnds from 'src/components/Coaching/general/functions/getWeekEnds';
import verifyRequiredInputs from 'src/components/Coaching/general/functions/inputValidation';
import ContextualControls from 'src/components/ContextualControls';
import * as helpers from 'src/hooks/CoachingData/helperFunctions';

import {
  useActiveMemberships,
  useActiveStudents,
  useCoachList,
  useGroupSessions,
  useWeeks,
} from 'src/hooks/CoachingData/queries';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useModal } from 'src/hooks/useModal';
import { useUserData } from 'src/hooks/UserData/useUserData';
import {
  CoachDropdown,
  DateInput,
  DeleteRecord,
  Dropdown,
  FormControls,
  LinkInput,
  TextAreaInput,
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
  const { contextual, openContextual } = useContextualMenu();
  return (
    <div className="cellWithContextual">
      {newRecord ? (
        <button
          type="button"
          className="greenButton"
          onClick={() =>
            openContextual(
              `groupSession${groupSession.recordId}week${week.recordId}`,
            )
          }
        >
          New
        </button>
      ) : (
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
      )}

      {contextual ===
        `groupSession${groupSession.recordId}week${week.recordId}` && (
        <GroupSessionView groupSession={groupSession} newRecord={newRecord} />
      )}
    </div>
  );
}

export function GroupSessionView({
  groupSession,
  newRecord,
}: {
  groupSession: GroupSession;
  newRecord?: boolean;
}) {
  const userDataQuery = useUserData();
  const { setContextualRef, closeContextual, updateDisableClickOutside } =
    useContextualMenu();
  const { openModal, closeModal } = useModal();

  const {
    getAttendeesFromGroupSessionId,
    createGroupSessionMutation,
    updateGroupSessionMutation,
    deleteGroupSessionMutation,
    createGroupAttendeesMutation,
    deleteGroupAttendeesMutation,
  } = useCoaching();
  const [date, setDate] = useState<string>(
    newRecord
      ? new Date().toISOString().split('T')[0]
      : typeof groupSession.date === 'string'
        ? groupSession.date
        : new Date(groupSession.date).toISOString().split('T')[0],
  );

  const relatedWeekStarts = useMemo(() => {
    const selectedDate = new Date(date);
    const day = selectedDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - day); // Go back to previous Sunday
    return weekStart.toISOString().split('T')[0];
  }, [date]);

  const { coachListQuery } = useCoachList();
  const { activeMembershipsQuery } = useActiveMemberships();
  const { activeStudentsQuery } = useActiveStudents();
  const { weeksQuery } = useWeeks(
    relatedWeekStarts,
    getWeekEnds(relatedWeekStarts),
  );
  const { groupSessionsTopicFieldOptionsQuery } = useGroupSessions(
    relatedWeekStarts,
    getWeekEnds(relatedWeekStarts),
  );

  // Rendering
  const dataReady =
    coachListQuery.isSuccess &&
    groupSessionsTopicFieldOptionsQuery.isSuccess &&
    activeMembershipsQuery.isSuccess &&
    activeStudentsQuery.isSuccess &&
    weeksQuery.isSuccess;

  const rendered = useRef(false);

  // State management
  const [editMode, setEditMode] = useState<boolean>(!!newRecord);
  const recordId = useMemo(
    () => (newRecord ? -1 : groupSession.recordId),
    [newRecord, groupSession.recordId],
  );

  const [sessionType, setSessionType] = useState<string>('');
  const [coach, setCoach] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [callDocument, setCallDocument] = useState<string>('');
  const [zoomLink, setZoomLink] = useState<string>('');

  interface attendeeChangesObj {
    name: string;
    relatedWeek: number;
    action?: 'add' | 'remove';
  }
  const [attendees, setAttendees] = useState<attendeeChangesObj[]>([]);

  // Edit or Update State
  const setInitialState = useCallback(() => {
    setSessionType(newRecord ? '' : groupSession.sessionType);
    const formattedDate = groupSession.date
      ? typeof groupSession.date === 'string'
        ? groupSession.date
        : new Date(groupSession.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    setDate(formattedDate);
    setCoach(newRecord ? '' : groupSession.coach.email);
    setTopic(newRecord ? '' : groupSession.topic);
    setComments(newRecord ? '' : groupSession.comments);
    setCallDocument(newRecord ? '' : groupSession.callDocument);
    setZoomLink(newRecord ? '' : groupSession.zoomLink);

    setAttendees(() => {
      if (newRecord) {
        return [];
      } else {
        const attendees = getAttendeesFromGroupSessionId(recordId);
        return attendees?.map((attendee) => ({
          name: attendee.weekStudent,
          relatedWeek: attendee.student,
        })) as attendeeChangesObj[];
      }
    });
  }, [getAttendeesFromGroupSessionId, groupSession, newRecord, recordId]);

  function handleAddAttendee(weekRecordId: number) {
    if (weekRecordId === -1) {
      setAttendees([{ name: 'No Attendees', relatedWeek: -1, action: 'add' }]);
      return;
    }

    // If adding a real attendee, first remove any "No Attendees" entry
    setAttendees((prev) =>
      prev.filter((attendee) => attendee.relatedWeek !== -1),
    );

    const membership = helpers.getMembershipFromWeekRecordId(
      weekRecordId,
      weeksQuery.data || [],
      activeMembershipsQuery.data || [],
    );

    if (!membership) {
      console.error('No membership found with week recordId:', weekRecordId);
      return;
    }

    const student = helpers.getStudentFromMembershipId(
      membership.recordId,
      activeMembershipsQuery.data || [],
      activeStudentsQuery.data || [],
    );

    if (!student) {
      console.error('No student found with membershipId:', membership.recordId);
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
        relatedWeek: weekRecordId,
        action: 'add',
      },
    ]);
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
  function checkInputChanges() {
    return !(
      date === groupSession.date &&
      coach === groupSession.coach.email &&
      sessionType === groupSession.sessionType &&
      topic === groupSession.topic &&
      comments === groupSession.comments &&
      callDocument === groupSession.callDocument &&
      zoomLink === groupSession.zoomLink
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
    // attendee records to delete afterwards
    const attendeesToRemove = getAttendeesFromGroupSessionId(recordId);
    deleteGroupSessionMutation.mutate(recordId, {
      onSuccess: () => {
        if (attendeesToRemove) {
          deleteGroupAttendeesMutation.mutate(
            attendeesToRemove?.map((attendee) => attendee.recordId),
          );
        }
      },
      onSettled: () => {
        closeModal();
        cancelEdit();
        closeContextual();
      },
    });
  }

  function captureSubmitForm() {
    // verify required fields
    const badInput = verifyRequiredInputs([
      { value: date, label: 'Date' },
      { value: coach, label: 'Coach' },
      { value: sessionType, label: 'Session Type' },
    ]);
    if (badInput) {
      openModal({
        title: 'Error',
        body: `${badInput} is a required field`,
        type: 'error',
      });
      return;
    }
    if (attendees.length === 0) {
      openModal({
        title: 'Error',
        body: 'At least one attendee is required',
        type: 'error',
      });
      return;
    }
    if (attendees.some((attendee) => attendee.name === 'No Attendees')) {
      openModal({
        title: 'Warning',
        body: 'You have marked that there are no attendees for this group session. Once you submit, you will not be able to add attendees.',
        type: 'confirm',
        confirmFunction: () => {
          submitCreationOrUpdate();
          closeModal();
        },
      });
      return;
    }

    submitCreationOrUpdate();
  }

  function submitCreationOrUpdate() {
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
            if (
              attendees.some((attendee) => attendee.name === 'No Attendees')
            ) {
              closeContextual();
              return;
            }
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
          onError: (error) => {
            console.error('Error creating group session', error);
          },
        },
      );
      // IMPORTANT! must await the creation of the group session
    } else {
      // verify if any changes were made
      if (!checkInputChanges() && !checkAttendeeChanges()) {
        console.error('No changes detected');
        disableEditMode();
        return;
      }
      if (checkInputChanges()) {
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
      if (checkAttendeeChanges()) {
        const currentAttendeeRecords = getAttendeesFromGroupSessionId(recordId);
        const attendeesToAdd = attendees.filter(
          (attendee) => attendee.action === 'add',
        );
        const attendeesToRemove_StepOne = attendees.filter(
          (attendee) => attendee.action === 'remove',
        );
        const attendeesToRemove = currentAttendeeRecords?.filter((attendee) =>
          attendeesToRemove_StepOne.find(
            (remove) => remove.relatedWeek === attendee.student,
          ),
        );
        if (attendeesToAdd && attendeesToAdd.length > 0) {
          createGroupAttendeesMutation.mutate(
            attendeesToAdd.map((attendee) => ({
              groupSession: recordId,
              student: attendee.relatedWeek,
            })),
          );
        }
        if (attendeesToRemove && attendeesToRemove.length > 0) {
          deleteGroupAttendeesMutation.mutate(
            attendeesToRemove.map((attendee) => attendee.recordId),
          );
        }
      }
      disableEditMode();
    }
  }
  // Clear attendees when week changes
  useEffect(() => {
    if (newRecord) {
      setAttendees([]);
    }
  }, [newRecord, relatedWeekStarts]);

  useEffect(() => {
    if (dataReady && !rendered.current) {
      setInitialState();
      rendered.current = true;
    }
  }, [dataReady, sessionType, setInitialState]);

  return (
    <div className="contextualWrapper">
      <div className="contextual" ref={setContextualRef}>
        <ContextualControls editFunction={toggleEditMode} />
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
              editMode
            />
          )}
        </div>
        <Dropdown
          value={topic}
          onChange={setTopic}
          editMode={editMode}
          options={
            groupSessionsTopicFieldOptionsQuery.data
              ? groupSessionsTopicFieldOptionsQuery.data.sort((a, b) => {
                  if (a && b) {
                    const aString = a.replace(/^"/g, '').toLowerCase();
                    const bString = b.replace(/^"/g, '').toLowerCase();
                    if (aString > bString) return 1;
                    else return -1;
                  }
                  return 0;
                })
              : []
          }
          label="Topic"
        />
        <TextAreaInput
          label="Comments"
          value={comments}
          onChange={setComments}
          editMode={editMode}
        />
        <LinkInput
          label="Call Document"
          value={callDocument}
          onChange={setCallDocument}
          editMode={editMode}
        />
        <LinkInput
          label="Zoom Link"
          value={zoomLink}
          onChange={setZoomLink}
          editMode={editMode}
        />
        {editMode && (
          <div className="lineWrapper">
            <label className="label">Add Attendees:</label>
            <div className="content">
              <CustomGroupAttendeeSelector
                weekStarts={relatedWeekStarts}
                onChange={handleAddAttendee}
              />
            </div>
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
                    <div
                      key={attendee.relatedWeek}
                      className="attendee-wrapper"
                    >
                      <p> {attendee.name}</p>
                      {editMode && (
                        <button
                          type="button"
                          className="redButton"
                          onClick={() =>
                            handleRemoveAttendee(attendee.relatedWeek)
                          }
                        >
                          Remove Attendee
                        </button>
                      )}
                    </div>
                  ),
              )}
          </div>
        </div>
        {editMode &&
          !newRecord &&
          userDataQuery.data?.roles.adminRole === 'admin' && (
            <DeleteRecord deleteFunction={deleteRecordFunction} />
          )}
        <FormControls
          editMode={editMode}
          cancelEdit={cancelEdit}
          captureSubmitForm={captureSubmitForm}
        />
      </div>
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
  const { groupSessionsQuery } = useCoaching();

  const dataReady = groupSessionsQuery.isSuccess;
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
        {/* {week.membershipCourseHasGroupCalls && (
          <GroupSessionCell
            groupSession={{ recordId: -1 } as GroupSession}
            newRecord
            week={week}
          />
        )} */}
      </>
    )
  );
}
