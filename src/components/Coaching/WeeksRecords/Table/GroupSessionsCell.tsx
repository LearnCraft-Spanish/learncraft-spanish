import type {
  BaseGroupSession,
  Coach,
  FurnishedWeekWithCoach,
} from '@learncraft-spanish/shared';

import { useAuthAdapter } from '@application/adapters/authAdapter';
import { Dropdown } from '@interface/components/FormComponents';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CoachDropdown,
  DateInput,
  FormControls,
  LinkInput,
  TextAreaInput,
} from 'src/components/FormComponents';
import { useAllCoachesQuery } from 'src/hexagon/application/queries/CoachQueries/useAllCoachesQuery';

import { useGroupCallLookupsQuery } from 'src/hexagon/application/queries/useGroupCallLookupsQuery';
import getLoggedInCoach from 'src/hexagon/domain/functions/getLoggedInCoach';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';

// const sessionTypeOptions = [
//   '1MC',
//   '2MC',
//   'Modules 1 & 2',
//   'Level 1',
//   'Level 2',
//   'Level 3',
//   'Level 4',
//   'Level 5',
//   'Level 6',
//   'Module 3',
//   'Module 4',
//   'LCS Cohort',
//   'Advanced',
//   'Conversation',
// ];

function GroupSessionCell({
  groupSession,
  week,
  newRecord,
  // tableEditMode,
}: {
  groupSession: BaseGroupSession;
  week: FurnishedWeekWithCoach;
  newRecord?: boolean;
  // tableEditMode: boolean;
}) {
  const { contextual, openContextual } = useContextualMenu();
  return (
    <div className="cellWithContextual">
      {/* {newRecord ? (
        <button
          type="button"
          className="greenButton"
          onClick={() =>
            openContextual(
              `groupSession${groupSession.groupSessionId}week${week.weekId}`,
            )
          }
          disabled={tableEditMode}
        >
          New
        </button> */}
      {/* ) : ( */}
      <button
        type="button"
        onClick={() =>
          openContextual(
            `groupSession${groupSession.groupSessionId}week${week.weekId}`,
          )
        }
      >
        {groupSession.groupSessionType?.groupSessionType}
      </button>
      {/* )} */}

      {contextual ===
        `groupSession${groupSession.groupSessionId}week${week.weekId}` && (
        <GroupSessionView
          groupSession={groupSession}
          newRecord={newRecord}
          // tableEditMode={tableEditMode}
        />
      )}
    </div>
  );
}

export function GroupSessionView({
  groupSession,
  newRecord,
  // tableEditMode,
  // onSuccess,
}: {
  groupSession: BaseGroupSession;
  newRecord?: boolean;
  // tableEditMode?: boolean;
  // onSuccess?: () => void;
}) {
  // const { authUser, isAdmin } = useAuthAdapter();
  const { authUser } = useAuthAdapter();
  // const { closeContextual, openContextual, updateDisableClickOutside } =
  //   useContextualMenu();
  // const { openModal, closeModal } = useModal();
  const { coaches } = useAllCoachesQuery();
  // const {
  //   getAttendeesFromGroupSessionId,
  //   // createGroupSessionMutation,
  //   // updateGroupSessionMutation,
  //   // deleteGroupSessionMutation,
  //   // createGroupAttendeesMutation,
  //   // deleteGroupAttendeesMutation,
  // } = useCoaching();

  const { groupSessionTypes, groupSessionTopics } = useGroupCallLookupsQuery();
  const [date, setDate] = useState<string>(
    newRecord
      ? new Date().toISOString().split('T')[0]
      : typeof groupSession.callDate === 'string'
        ? groupSession.callDate
        : new Date(groupSession.callDate).toISOString().split('T')[0],
  );

  // const relatedWeekStarts = useMemo(() => {
  //   const selectedDate = new Date(date);
  //   const day = selectedDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
  //   const weekStart = new Date(selectedDate);
  //   weekStart.setDate(selectedDate.getDate() - day); // Go back to previous Sunday
  //   return weekStart.toISOString().split('T')[0];
  // }, [date]);

  // const { coachListQuery } = useCoachList();
  // const { activeMembershipsQuery } = useActiveMemberships({
  //   startDate: relatedWeekStarts,
  //   endDate: getWeekEnds(relatedWeekStarts),
  // });
  // const { activeStudentsQuery } = useActiveStudents({
  //   startDate: relatedWeekStarts,
  //   endDate: getWeekEnds(relatedWeekStarts),
  // });
  // const { weeksQuery } = useWeeks(
  //   relatedWeekStarts,
  //   getWeekEnds(relatedWeekStarts),
  // );
  // const {
  //   groupSessionsTopicFieldOptionsQuery,
  //   createGroupSessionsTopicFieldOptionsMutation,
  // } = useGroupSessions(relatedWeekStarts, getWeekEnds(relatedWeekStarts));

  // Rendering
  // const dataReady =
  // coachListQuery.isSuccess &&
  // groupSessionsTopicFieldOptionsQuery.isSuccess &&
  // activeMembershipsQuery.isSuccess &&
  // activeStudentsQuery.isSuccess &&
  // weeksQuery.isSuccess;

  const rendered = useRef(false);

  // State management
  // const [editMode, setEditMode] = useState<boolean>(!!newRecord);
  const editMode = false;

  // const recordId = useMemo(
  //   () => (newRecord ? -1 : groupSession.groupSessionId),
  //   [newRecord, groupSession.groupSessionId],
  // );

  const [sessionType, setSessionType] = useState<string>('');
  // temp default values, will fix later
  const [coach, setCoach] = useState<Coach | null>(null);
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
    const defaultCoachForNewRecord =
      getLoggedInCoach(authUser.email || '', coaches || []) || null;
    setSessionType(
      newRecord ? '' : groupSession.groupSessionType?.groupSessionType || '',
    );

    const formattedDate = groupSession.callDate
      ? typeof groupSession.callDate === 'string'
        ? groupSession.callDate
        : new Date(groupSession.callDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    setDate(formattedDate);
    setCoach(newRecord ? defaultCoachForNewRecord : groupSession.coach);
    setTopic(
      newRecord ? '' : groupSession.groupSessionTopic?.groupSessionTopic || '',
    );
    setComments(newRecord ? '' : groupSession.comments || '');
    setCallDocument(newRecord ? '' : groupSession.callDocument || '');
    setZoomLink(newRecord ? '' : groupSession.zoomLink || '');

    setAttendees(() => {
      if (newRecord) {
        return [];
      }

      return (
        groupSession.attendees?.map((attendee) => ({
          name: attendee.studentFullName,
          relatedWeek: attendee.weekId,
        })) ?? []
      );
    });
  }, [groupSession, newRecord, coaches, authUser.email]);

  // function handleAddAttendee(weekRecordId: number) {
  //   if (weekRecordId === -1) {
  //     setAttendees([{ name: 'No Attendees', relatedWeek: -1, action: 'add' }]);
  //     return;
  //   }

  //   // If adding a real attendee, first remove any "No Attendees" entry
  //   setAttendees((prev) =>
  //     prev.filter((attendee) => attendee.relatedWeek !== -1),
  //   );
  //   // Foreign Key lookup, orm data in backend
  //   const membership = helpers.getMembershipFromWeekRecordId(
  //     weekRecordId,
  //     weeksQuery.data || [],
  //     activeMembershipsQuery.data || [],
  //   );

  //   if (!membership) {
  //     console.error('No membership found with week recordId:', weekRecordId);
  //     return;
  //   }
  //   // Foreign Key lookup, orm data in backend
  //   const student = helpers.getStudentFromMembershipId(
  //     membership.recordId,
  //     activeMembershipsQuery.data || [],
  //     activeStudentsQuery.data || [],
  //   );

  //   if (!student) {
  //     console.error('No student found with membershipId:', membership.recordId);
  //     return;
  //   }

  //   // if the student is already in the list, don't add it again
  //   if (attendees.find((attendee) => attendee.name === student.fullName)) {
  //     if (
  //       attendees.find((attendee) => attendee.name === student.fullName)
  //         ?.action === 'remove'
  //     ) {
  //       // if the student was previously removed, remove the 'remove' action
  //       setAttendees((prev) =>
  //         prev.map((attendee) =>
  //           attendee.name === student.fullName
  //             ? { ...attendee, action: undefined }
  //             : attendee,
  //         ),
  //       );
  //       return;
  //     }
  //     return;
  //   }
  //   // Add the new attendee to the list
  //   setAttendees((prev) => [
  //     ...prev,
  //     {
  //       name: student.fullName,
  //       relatedWeek: weekRecordId,
  //       action: 'add',
  //     },
  //   ]);
  // }

  // function handleRemoveAttendee(relatedWeek: number | string) {
  //   const recordId = Number.parseInt(relatedWeek as string);

  //   const attendeeToRemove = attendees.find(
  //     (attendee) => attendee.relatedWeek === recordId,
  //   );
  //   if (!attendeeToRemove) {
  //     console.error('No attendee found with week recordId:', recordId);
  //     return;
  //   }
  //   if (attendeeToRemove.action === 'add') {
  //     // remove the attendee from the list, if it was added in this session
  //     setAttendees((prev) =>
  //       prev.filter((attendee) => attendee.relatedWeek !== recordId),
  //     );
  //   } else {
  //     // set the action of the attendee to remove, since it was already in the list
  //     setAttendees((prev) =>
  //       prev.map((attendee) =>
  //         attendee.relatedWeek === recordId
  //           ? { ...attendee, action: 'remove' }
  //           : attendee,
  //       ),
  //     );
  //   }
  // }

  // function updateCoach(email: string) {
  //   const corrector = coachListQuery.data?.find(
  //     (coach) => coach.user.email === email,
  //   );
  //   if (!corrector) {
  //     console.error('No coach found with email:', email);
  //     return;
  //   }
  //   setCoach(corrector.user.email);
  // }
  //Helper funcs
  // function checkAttendeeChanges() {
  //   // check if any attendees were added or removed
  //   return attendees.some(
  //     (attendee) =>
  //       attendee.action &&
  //       (attendee.action === 'add' || attendee.action === 'remove'),
  //   );
  // }
  // function checkInputChanges() {
  //   return !(
  //     date === groupSession.date &&
  //     coach === groupSession.coach.email &&
  //     sessionType === groupSession.sessionType &&
  //     topic === groupSession.topic &&
  //     comments === groupSession.comments &&
  //     callDocument === groupSession.callDocument &&
  //     zoomLink === groupSession.zoomLink
  //   );
  // }

  // Editing Functions

  // function enableEditMode() {
  //   setEditMode(true);
  //   updateDisableClickOutside(true);
  // }
  // function disableEditMode() {
  //   setEditMode(false);
  //   updateDisableClickOutside(false);
  // }

  // function cancelEdit() {
  //   if (newRecord) {
  //     closeContextual();
  //     return;
  //   }
  //   disableEditMode();
  //   setInitialState();
  // }
  // function toggleEditMode() {
  //   if (editMode) {
  //     cancelEdit();
  //   } else {
  //     enableEditMode();
  //   }
  // }
  // function deleteRecordFunction() {
  //   // attendee records to delete afterwards
  //   // Use preloaded attendees if available, otherwise do Foreign Key lookup from backend
  //   const attendeesToRemove =
  //     groupSession.attendees ?? getAttendeesFromGroupSessionId(recordId);
  //   deleteGroupSessionMutation.mutate(recordId, {
  //     onSuccess: () => {
  //       if (attendeesToRemove && attendeesToRemove.length > 0) {
  //         deleteGroupAttendeesMutation.mutate(
  //           attendeesToRemove?.map((attendee) => attendee.recordId),
  //         );
  //       }
  //     },
  //     onSettled: () => {
  //       closeModal();
  //       cancelEdit();
  //       closeContextual();
  //       onSuccess?.();
  //     },
  //   });
  // }

  // function captureSubmitForm() {
  //   // verify required fields
  //   const badInput = verifyRequiredInputs([
  //     { value: date, label: 'Date' },
  //     { value: coach, label: 'Coach' },
  //     { value: sessionType, label: 'Session Type' },
  //   ]);
  //   if (badInput) {
  //     openModal({
  //       title: 'Error',
  //       body: `${badInput} is a required field`,
  //       type: 'error',
  //     });
  //     return;
  //   }
  //   if (callDocument && !isValidUrl(callDocument)) {
  //     openModal({
  //       title: 'Error',
  //       body: 'Call Document must be a valid url',
  //       type: 'error',
  //     });
  //     return;
  //   }
  //   if (attendees.length === 0) {
  //     openModal({
  //       title: 'Error',
  //       body: 'At least one attendee is required',
  //       type: 'error',
  //     });
  //     return;
  //   }
  //   if (attendees.some((attendee) => attendee.name === 'No Attendees')) {
  //     openModal({
  //       title: 'Warning',
  //       body: 'You have marked that there are no attendees for this group session. Once you submit, you will not be able to add attendees.',
  //       type: 'confirm',
  //       confirmFunction: () => {
  //         submitCreationOrUpdate();
  //         closeModal();
  //       },
  //     });
  //     return;
  //   }

  //   submitCreationOrUpdate();
  // }

  // function submitCreationOrUpdate() {
  //   disableEditMode();
  //   disableEditMode();
  //   if (newRecord) {
  //     createGroupSessionMutation.mutate(
  //       {
  //         date,
  //         coach,
  //         sessionType,
  //         topic,
  //         comments,
  //         callDocument,
  //         zoomLink,
  //       },
  //       {
  //         onSuccess: (data: GroupSession) => {
  //           // data will be an array of record ID's created
  //           if (!data) {
  //             console.error('Error creating group session');
  //             return;
  //           }
  //           const newRecordId = data.recordId;
  //           if (
  //             attendees.some((attendee) => attendee.name === 'No Attendees')
  //           ) {
  //             return;
  //           }
  //           // once it is created, add the attendees
  //           const attendeesToAdd = attendees.filter(
  //             (attendee) => attendee.action === 'add',
  //           );
  //           createGroupAttendeesMutation.mutate(
  //             attendeesToAdd.map((attendee) => ({
  //               groupSession: newRecordId,
  //               student: attendee.relatedWeek,
  //             })),
  //             {
  //               onSuccess: (data: GroupAttendees[]) => {
  //                 // data will be an array of record ID's created
  //                 if (data.length !== attendeesToAdd.length) {
  //                   console.error('Error creating group attendees');
  //                   return;
  //                 }
  //                 // open correct contextual for new record
  //                 setTimeout(() => {
  //                   openContextual(
  //                     `groupSession${newRecordId}week${attendeesToAdd[0].relatedWeek}`,
  //                   );
  //                 }, 200);
  //                 onSuccess?.();
  //               },
  //               onError: (error) => {
  //                 console.error('Error creating group attendees', error);
  //               },
  //             },
  //           );
  //         },
  //         onError: (error) => {
  //           console.error('Error creating group session', error);
  //         },
  //       },
  //     );
  //     // IMPORTANT! must await the creation of the group session
  //   } else {
  //     // verify if any changes were made
  //     if (!checkInputChanges() && !checkAttendeeChanges()) {
  //       console.error('No changes detected');
  //       disableEditMode();
  //       return;
  //     }
  //     if (checkInputChanges()) {
  //       updateGroupSessionMutation.mutate(
  //         {
  //           recordId,
  //           date,
  //           coach,
  //           sessionType,
  //           topic,
  //           comments,
  //           callDocument,
  //           zoomLink,
  //         },
  //         {
  //           onSuccess: () => {
  //             onSuccess?.();
  //           },
  //         },
  //       );
  //     }
  //     if (checkAttendeeChanges()) {
  //       // Use preloaded attendees if available, otherwise do Foreign Key lookup from backend
  //       const currentAttendeeRecords =
  //         groupSession.attendees ?? getAttendeesFromGroupSessionId(recordId);
  //       const attendeesToAdd = attendees.filter(
  //         (attendee) => attendee.action === 'add',
  //       );
  //       const attendeesToRemove_StepOne = attendees.filter(
  //         (attendee) => attendee.action === 'remove',
  //       );
  //       const attendeesToRemove = currentAttendeeRecords?.filter((attendee) =>
  //         attendeesToRemove_StepOne.find(
  //           (remove) => remove.relatedWeek === attendee.student,
  //         ),
  //       );
  //       if (attendeesToAdd && attendeesToAdd.length > 0) {
  //         createGroupAttendeesMutation.mutate(
  //           attendeesToAdd.map((attendee) => ({
  //             groupSession: recordId,
  //             student: attendee.relatedWeek,
  //           })),
  //           {
  //             onSuccess: () => {
  //               onSuccess?.();
  //             },
  //           },
  //         );
  //       }
  //       if (attendeesToRemove && attendeesToRemove.length > 0) {
  //         deleteGroupAttendeesMutation.mutate(
  //           attendeesToRemove.map((attendee) => attendee.recordId),
  //           {
  //             onSuccess: () => {
  //               onSuccess?.();
  //             },
  //           },
  //         );
  //       }
  //     }
  //     disableEditMode();
  //   }
  // }
  // // Clear attendees when week changes
  // useEffect(() => {
  //   if (newRecord) {
  //     setAttendees([]);
  //   }
  // }, [newRecord, relatedWeekStarts]);

  useEffect(() => {
    if (coaches && !rendered.current) {
      setInitialState();
      rendered.current = true;
    }
  }, [coaches, sessionType, setInitialState]);

  return (
    // <ContextualView editFunction={tableEditMode ? undefined : toggleEditMode}>
    <ContextualView>
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
          coachId={coach?.coach_id || 0}
          onChange={(coachId) =>
            setCoach(
              coaches?.find((coach) => coach.coach_id === coachId) || null,
            )
          }
          editMode={editMode}
          required
        />
        {editMode && <DateInput value={date} onChange={setDate} required />}
        {editMode && (
          <Dropdown
            label="Session Type"
            value={sessionType}
            onChange={setSessionType}
            options={
              groupSessionTypes?.map((type) => type.groupSessionType) || []
            }
            editMode
            required
          />
        )}
      </div>
      {/* <Dropdown
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
      /> */}
      {/* <CustomGroupSessionTopicSelector
        selectedTopic={topic}
        selectTopicFunction={setTopic}
        topicOptions={groupSessionsTopicFieldOptionsQuery.data || []}
        addNewTopicFunction={
          createGroupSessionsTopicFieldOptionsMutation.mutate
        }
        removeSelectedTopicFunction={() => setTopic('')}
        isLoading={groupSessionsTopicFieldOptionsQuery.isLoading}
      /> */}
      <Dropdown
        label="Topic"
        value={topic}
        onChange={setTopic}
        options={
          groupSessionTopics?.map((topic) => topic.groupSessionTopic) || []
        }
        editMode
        required
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
      {/* {editMode && (
        <div className="lineWrapper">
          <label className="label">Add Attendees:</label>
          <div className="content">
            <CustomGroupAttendeeSelector
              weekStarts={relatedWeekStarts}
              onChange={handleAddAttendee}
            />
          </div>
        </div>
      )} */}
      <div className="lineWrapper">
        <label className="label">Attendees:</label>
        <div className="content">
          {attendees &&
            attendees.map(
              (attendee) =>
                // if attendee is to be removed, don't display it
                attendee.action !== 'remove' && (
                  <div key={attendee.relatedWeek} className="attendee-wrapper">
                    <p> {attendee.name}</p>
                    {/* {editMode && (
                      <button
                        type="button"
                        className="redButton"
                        onClick={() =>
                          handleRemoveAttendee(attendee.relatedWeek)
                        }
                      >
                        Remove Attendee
                      </button>
                    )} */}
                  </div>
                ),
            )}
        </div>
      </div>
      {/* {editMode && !newRecord && isAdmin && (
        <DeleteRecord deleteFunction={deleteRecordFunction} />
      )} */}
      <FormControls
        editMode={editMode}
        // cancelEdit={cancelEdit}
        cancelEdit={() => {}}
        // captureSubmitForm={captureSubmitForm}
        captureSubmitForm={() => {}}
      />
    </ContextualView>
  );
}

export default function GroupSessionsCell({
  week,
  groupSessions,
  // tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  groupSessions: BaseGroupSession[] | null;
  // tableEditMode: boolean;
}) {
  // const { groupSessionsQuery } = useCoaching();

  // const dataReady = groupSessionsQuery.isSuccess;
  return (
    // dataReady && (
    <>
      {groupSessions?.map((groupSession) => (
        <GroupSessionCell
          groupSession={groupSession}
          key={groupSession.groupSessionId}
          week={week}
          // tableEditMode={tableEditMode}
        />
      ))}
    </>
  );
}
