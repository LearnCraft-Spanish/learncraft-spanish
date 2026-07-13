import type {
  BaseGroupSession,
  Coach,
  FurnishedWeekWithCoach,
  GroupSessionTopic,
  GroupSessionType,
} from '@learncraft-spanish/shared';
import type { SetStateAction } from 'react';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { Dropdown } from '@interface/components/FormComponents';
import { useEffect, useMemo, useState } from 'react';
import { CustomStudentSelector } from 'src/components/Coaching/general/CustomStudentSelector';
import {
  CoachDropdown,
  DateInput,
  DeleteRecord,
  FormControls,
  LinkInput,
  TextAreaInput,
  verifyRequiredInputs,
} from 'src/components/FormComponents';
import { isValidUrl } from 'src/components/FormComponents/functions/inputValidation';
import { useAllCoachesQuery } from 'src/hexagon/application/queries/CoachQueries/useAllCoachesQuery';
import { useGroupCallMutations } from 'src/hexagon/application/queries/GroupCallQueries/useGroupCallMutations';
import { useGroupCallLookupsQuery } from 'src/hexagon/application/queries/useGroupCallLookupsQuery';
import { useWeeksByStartDate } from 'src/hexagon/application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { toReadableMonthDay } from 'src/hexagon/domain/functions/dateUtils';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';

interface AttendeeSelection {
  weekId: number;
  studentFullName: string;
}

function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }

  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  return date.split('T')[0];
}

function getSortedWeekIds(attendees: AttendeeSelection[]): number[] {
  return attendees.map((attendee) => attendee.weekId).sort((a, b) => a - b);
}

function normalizeStudentName(name: string): string {
  return name.trim().toLowerCase();
}

function remapAttendeesByName(
  attendeeNames: string[],
  weeks: FurnishedWeekWithCoach[],
): AttendeeSelection[] {
  return attendeeNames.flatMap((attendeeName) => {
    const matchedWeek = weeks.find(
      (week) =>
        normalizeStudentName(week.student?.fullName || '') ===
        normalizeStudentName(attendeeName),
    );

    if (!matchedWeek) {
      return [];
    }

    return [
      {
        weekId: matchedWeek.weekId,
        studentFullName: matchedWeek.student?.fullName || attendeeName,
      },
    ];
  });
}

function hasSameAttendeeWeekIds(
  currentAttendees: AttendeeSelection[],
  originalWeekIds: number[],
): boolean {
  const currentWeekIds = getSortedWeekIds(currentAttendees);
  const sortedOriginalWeekIds = [...originalWeekIds].sort((a, b) => a - b);

  return (
    currentWeekIds.length === sortedOriginalWeekIds.length &&
    currentWeekIds.every(
      (weekId, index) => weekId === sortedOriginalWeekIds[index],
    )
  );
}

function getDefaultCoachId(
  coaches: Coach[] | undefined,
  email: string,
): number {
  return coaches?.find((coach) => coach.email === email)?.coach_id || 0;
}

function getWeekStartsFromDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - date.getDay());
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function GroupSessionCell({
  groupSession,
  week,
  tableEditMode,
}: {
  groupSession: BaseGroupSession;
  week: FurnishedWeekWithCoach;
  tableEditMode: boolean;
}) {
  const { contextual, openContextual } = useContextualMenu();
  const contextualKey = `groupSession${groupSession.groupSessionId}week${week.weekId}`;

  return (
    <div className="cellWithContextual">
      <button type="button" onClick={() => openContextual(contextualKey)}>
        {groupSession.groupSessionType?.groupSessionType || 'Group Session'}
      </button>

      {contextual === contextualKey && (
        <GroupSessionView
          groupSession={groupSession}
          tableEditMode={tableEditMode}
        />
      )}
    </div>
  );
}

export function GroupSessionView({
  groupSession,
  tableEditMode,
  onSuccess,
}: {
  groupSession: BaseGroupSession;
  tableEditMode: boolean;
  onSuccess?: () => void;
}) {
  const { isAdmin } = useAuthAdapter();
  const { closeContextual, updateDisableClickOutside } = useContextualMenu();
  const { closeModal, openModal } = useModal();
  const { updateGroupCallMutation, deleteGroupCallMutation } =
    useGroupCallMutations();
  const { groupSessionTypes, groupSessionTopics } = useGroupCallLookupsQuery();

  const [editMode, setEditMode] = useState(false);
  const [coachId, setCoachId] = useState(groupSession.coach.coach_id);
  const [date, setDate] = useState(formatDateInput(groupSession.callDate));
  const [sessionType, setSessionType] = useState<GroupSessionType | undefined>(
    groupSession.groupSessionType,
  );
  const [topic, setTopic] = useState<GroupSessionTopic | null | undefined>(
    groupSession.groupSessionTopic,
  );
  const [comments, setComments] = useState(groupSession.comments || '');
  const [callDocument, setCallDocument] = useState(
    groupSession.callDocument || '',
  );
  const [zoomLink, setZoomLink] = useState(groupSession.zoomLink || '');
  const [attendees, setAttendees] = useState<AttendeeSelection[]>(
    groupSession.attendees.map((attendee) => ({
      weekId: attendee.weekId,
      studentFullName: attendee.studentFullName,
    })),
  );
  const [pendingAttendeeRemapNames, setPendingAttendeeRemapNames] = useState<
    string[] | null
  >(null);
  const activeWeekStarts = useMemo(() => getWeekStartsFromDate(date), [date]);
  const { weeks, loading: weeksLoading } =
    useWeeksByStartDate(activeWeekStarts);

  useEffect(() => {
    if (!pendingAttendeeRemapNames || weeksLoading) {
      return;
    }

    setAttendees(remapAttendeesByName(pendingAttendeeRemapNames, weeks));
    setPendingAttendeeRemapNames(null);
  }, [pendingAttendeeRemapNames, weeks, weeksLoading]);

  function resetState() {
    setCoachId(groupSession.coach.coach_id);
    setDate(formatDateInput(groupSession.callDate));
    setSessionType(groupSession.groupSessionType);
    setTopic(groupSession.groupSessionTopic);
    setComments(groupSession.comments || '');
    setCallDocument(groupSession.callDocument || '');
    setZoomLink(groupSession.zoomLink || '');
    setAttendees(
      groupSession.attendees.map((attendee) => ({
        weekId: attendee.weekId,
        studentFullName: attendee.studentFullName,
      })),
    );
    setPendingAttendeeRemapNames(null);
  }

  function enableEditMode() {
    setEditMode(true);
    updateDisableClickOutside(true);
  }

  function disableEditMode() {
    setEditMode(false);
    updateDisableClickOutside(false);
  }

  function cancelEdit() {
    disableEditMode();
    resetState();
  }

  function toggleEditMode() {
    if (editMode) {
      cancelEdit();
    } else {
      enableEditMode();
    }
  }

  function addAttendee(weekId: number) {
    const selectedWeek = weeks.find(
      (possibleWeek) => possibleWeek.weekId === weekId,
    );

    if (!selectedWeek) {
      return;
    }

    setAttendees((prev) => [
      ...prev,
      {
        weekId: selectedWeek.weekId,
        studentFullName: selectedWeek.student?.fullName || 'No Student',
      },
    ]);
  }

  function applyDateChange(nextDate: string) {
    setPendingAttendeeRemapNames(
      attendees.map((attendee) => attendee.studentFullName),
    );
    setDate(nextDate);
  }

  function updateDate(value: SetStateAction<string>) {
    const nextDate = typeof value === 'function' ? value(date) : value;
    const nextWeekStarts = getWeekStartsFromDate(nextDate);

    if (nextWeekStarts === activeWeekStarts) {
      setDate(nextDate);
      return;
    }

    openModal({
      title: 'Confirm Date Change',
      body: 'Changing the date will attempt to move what weeks this group session is related to. Some students currently assigned to this group call may not be updated properly. Please double check that all attendees marked after this date change are correct.',
      type: 'confirm',
      confirmFunction: () => {
        applyDateChange(nextDate);
        closeModal();
      },
      cancelFunction: () => {
        closeModal();
      },
    });
  }

  function removeAttendee(weekId: number) {
    setAttendees((prev) =>
      prev.filter((attendee) => attendee.weekId !== weekId),
    );
  }

  function deleteRecordFunction() {
    deleteGroupCallMutation.mutate(
      { groupSessionId: groupSession.groupSessionId },
      {
        onSuccess: () => {
          closeModal();
          cancelEdit();
          closeContextual();
          onSuccess?.();
        },
      },
    );
  }

  function hasInputChanges() {
    return (
      coachId !== groupSession.coach.coach_id ||
      date !== formatDateInput(groupSession.callDate) ||
      sessionType?.groupSessionTypeId !==
        groupSession.groupSessionType?.groupSessionTypeId ||
      topic?.groupSessionTopicId !==
        groupSession.groupSessionTopic?.groupSessionTopicId ||
      comments !== (groupSession.comments || '') ||
      callDocument !== (groupSession.callDocument || '') ||
      zoomLink !== (groupSession.zoomLink || '') ||
      !hasSameAttendeeWeekIds(
        attendees,
        groupSession.attendees.map((attendee) => attendee.weekId),
      )
    );
  }

  function captureSubmitForm() {
    if (!hasInputChanges()) {
      cancelEdit();
      return;
    }

    const badInput = verifyRequiredInputs([
      { value: date, label: 'Date' },
      { value: coachId ? String(coachId) : '', label: 'Coach' },
      {
        value: sessionType?.groupSessionType || '',
        label: 'Session Type',
      },
      { value: topic?.groupSessionTopic || '', label: 'Topic' },
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

    if (callDocument && !isValidUrl(callDocument)) {
      openModal({
        title: 'Error',
        body: 'Call Document must be a valid url',
        type: 'error',
      });
      return;
    }

    if (zoomLink && !isValidUrl(zoomLink)) {
      openModal({
        title: 'Error',
        body: 'Zoom Link must be a valid url',
        type: 'error',
      });
      return;
    }

    if (!sessionType || !topic) {
      return;
    }

    updateGroupCallMutation.mutate(
      {
        groupSessionId: groupSession.groupSessionId,
        coach: coachId,
        callDate: date,
        groupSessionType: sessionType,
        groupSessionTopic: topic,
        comments,
        callDocument,
        zoomLink,
        attendeeWeekIds: getSortedWeekIds(attendees),
      },
      {
        onSuccess: () => {
          disableEditMode();
          onSuccess?.();
        },
      },
    );
  }

  return (
    <ContextualView editFunction={tableEditMode ? undefined : toggleEditMode}>
      {editMode ? (
        <h4>Edit Group Session</h4>
      ) : (
        <h4>
          {sessionType?.groupSessionType || 'Group Session'} on{' '}
          {toReadableMonthDay(date)}
        </h4>
      )}

      <CoachDropdown
        coachId={coachId}
        onChange={setCoachId}
        editMode={editMode}
        required
      />

      <DateInput
        value={date}
        onChange={updateDate}
        required
        editMode={editMode}
      />

      <Dropdown
        label="Session Type"
        value={sessionType?.groupSessionType || ''}
        onChange={(value) => {
          const selectedType = groupSessionTypes?.find(
            (type) => type.groupSessionType === value,
          );
          if (!selectedType) {
            console.error('No group session type found with value:', value);
            return;
          }
          setSessionType(selectedType);
        }}
        options={groupSessionTypes?.map((type) => type.groupSessionType) || []}
        editMode={editMode}
        required
      />

      <Dropdown
        label="Topic"
        value={topic?.groupSessionTopic || ''}
        onChange={(value) => {
          const selectedTopic = groupSessionTopics?.find(
            (topic) => topic.groupSessionTopic === value,
          );
          if (!selectedTopic) {
            console.error('No group session topic found with value:', value);
            return;
          }
          setTopic(selectedTopic);
        }}
        options={
          groupSessionTopics?.map((topic) => topic.groupSessionTopic) || []
        }
        editMode={editMode}
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

      {editMode && (
        <div className="lineWrapper">
          <label className="label" htmlFor="editGroupCallAttendee">
            Add Attendee:
          </label>
          <div className="content" id="editGroupCallAttendee">
            <CustomStudentSelector
              weekStarts={activeWeekStarts}
              onChange={addAttendee}
              excludedWeekIds={attendees.map((attendee) => attendee.weekId)}
              displayWeekStarts={false}
            />
          </div>
        </div>
      )}

      <div className="lineWrapper">
        <label className="label">Attendees:</label>
        <div className="content">
          {attendees.map((attendee) => (
            <div key={attendee.weekId} className="attendee-wrapper">
              <p>{attendee.studentFullName}</p>
              {editMode && (
                <button
                  type="button"
                  className="redButton"
                  onClick={() => removeAttendee(attendee.weekId)}
                >
                  Remove Attendee
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {editMode && isAdmin && (
        <DeleteRecord deleteFunction={deleteRecordFunction} />
      )}

      <FormControls
        editMode={editMode}
        cancelEdit={cancelEdit}
        captureSubmitForm={captureSubmitForm}
      />
    </ContextualView>
  );
}

export function NewGroupSessionView({
  onSuccess,
  weekStartsDefaultValue,
}: {
  onSuccess?: () => void;
  weekStartsDefaultValue: string;
}) {
  const { createGroupCallMutation } = useGroupCallMutations();
  const { groupSessionTypes, groupSessionTopics } = useGroupCallLookupsQuery();
  const { closeContextual, openContextual } = useContextualMenu();
  const { openModal } = useModal();
  const { authUser } = useAuthAdapter();
  const { coaches } = useAllCoachesQuery();

  const defaultCoachId = getDefaultCoachId(coaches, authUser.email || '');
  const [editMode, setEditMode] = useState(true);
  const [coachId, setCoachId] = useState(defaultCoachId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<GroupSessionType>();
  const [topic, setTopic] = useState<GroupSessionTopic>();
  const [comments, setComments] = useState('');
  const [callDocument, setCallDocument] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [attendees, setAttendees] = useState<AttendeeSelection[]>([]);
  const activeWeekStarts = useMemo(
    () => (date ? getWeekStartsFromDate(date) : weekStartsDefaultValue),
    [date, weekStartsDefaultValue],
  );
  const { weeks } = useWeeksByStartDate(activeWeekStarts);

  useEffect(() => {
    if (coachId === 0 && defaultCoachId !== 0) {
      setCoachId(defaultCoachId);
    }
  }, [coachId, defaultCoachId]);

  function updateDate(value: SetStateAction<string>) {
    setDate(value);
    setAttendees([]);
  }

  function addAttendee(weekId: number) {
    const selectedWeek = weeks.find(
      (possibleWeek) => possibleWeek.weekId === weekId,
    );

    if (!selectedWeek) {
      return;
    }

    setAttendees((prev) => [
      ...prev,
      {
        weekId: selectedWeek.weekId,
        studentFullName: selectedWeek.student?.fullName || 'No Student',
      },
    ]);
  }

  function removeAttendee(weekId: number) {
    setAttendees((prev) =>
      prev.filter((attendee) => attendee.weekId !== weekId),
    );
  }

  function createNewGroupSession() {
    const badInput = verifyRequiredInputs([
      { value: date, label: 'Date' },
      { value: coachId ? String(coachId) : '', label: 'Coach' },
      {
        value: sessionType?.groupSessionType || '',
        label: 'Session Type',
      },
      { value: topic?.groupSessionTopic || '', label: 'Topic' },
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

    if (callDocument && !isValidUrl(callDocument)) {
      openModal({
        title: 'Error',
        body: 'Call Document must be a valid url',
        type: 'error',
      });
      return;
    }

    if (zoomLink && !isValidUrl(zoomLink)) {
      openModal({
        title: 'Error',
        body: 'Zoom Link must be a valid url',
        type: 'error',
      });
      return;
    }

    if (!sessionType || !topic) {
      return;
    }

    setEditMode(false);
    createGroupCallMutation.mutate(
      {
        coach: coachId,
        callDate: date,
        groupSessionType: sessionType,
        groupSessionTopic: topic,
        comments,
        callDocument,
        zoomLink,
        attendeeWeekIds: getSortedWeekIds(attendees),
      },
      {
        onSuccess: (newGroupCall) => {
          onSuccess?.();
          const firstAttendeeWeekId = newGroupCall.attendees[0]?.weekId;
          if (!firstAttendeeWeekId) {
            closeContextual();
            return;
          }
          openContextual(
            `groupSession${newGroupCall.groupSessionId}week${firstAttendeeWeekId}`,
          );
        },
      },
    );
  }

  function toggleEditMode() {
    setEditMode((prev) => !prev);
  }

  return (
    <ContextualView editFunction={toggleEditMode}>
      {editMode ? (
        <h4>Create Group Session</h4>
      ) : (
        <h4>
          {sessionType?.groupSessionType || 'Group Session'} on{' '}
          {toReadableMonthDay(date)}
        </h4>
      )}

      <CoachDropdown
        coachId={coachId}
        onChange={setCoachId}
        editMode={editMode}
        required
      />

      <DateInput
        value={date}
        onChange={updateDate}
        required
        editMode={editMode}
      />

      <Dropdown
        label="Session Type"
        value={sessionType?.groupSessionType || ''}
        onChange={(value) => {
          const selectedType = groupSessionTypes?.find(
            (type) => type.groupSessionType === value,
          );
          if (!selectedType) {
            console.error('No group session type found with value:', value);
            return;
          }
          setSessionType(selectedType);
        }}
        options={groupSessionTypes?.map((type) => type.groupSessionType) || []}
        editMode={editMode}
        required
      />

      <Dropdown
        label="Topic"
        value={topic?.groupSessionTopic || ''}
        onChange={(value) => {
          const selectedTopic = groupSessionTopics?.find(
            (topic) => topic.groupSessionTopic === value,
          );
          if (!selectedTopic) {
            console.error('No group session topic found with value:', value);
            return;
          }
          setTopic(selectedTopic);
        }}
        options={
          groupSessionTopics?.map((topic) => topic.groupSessionTopic) || []
        }
        editMode={editMode}
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

      {editMode && (
        <div className="lineWrapper">
          <label className="label" htmlFor="groupCallAttendee">
            Add Attendee:
          </label>
          <div className="content" id="groupCallAttendee">
            <CustomStudentSelector
              weekStarts={activeWeekStarts}
              onChange={addAttendee}
              excludedWeekIds={attendees.map((attendee) => attendee.weekId)}
              displayWeekStarts={false}
            />
          </div>
        </div>
      )}

      <div className="lineWrapper">
        <label className="label">Attendees:</label>
        <div className="content">
          {attendees.map((attendee) => (
            <div key={attendee.weekId} className="attendee-wrapper">
              <p>{attendee.studentFullName}</p>
              {editMode && (
                <button
                  type="button"
                  className="redButton"
                  onClick={() => removeAttendee(attendee.weekId)}
                >
                  Remove Attendee
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <FormControls
        captureSubmitForm={createNewGroupSession}
        cancelEdit={() => closeContextual()}
        editMode={editMode}
      />
    </ContextualView>
  );
}

export default function GroupSessionsCell({
  week,
  groupSessions,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  groupSessions: BaseGroupSession[] | null;
  tableEditMode: boolean;
}) {
  return (
    <div className="callBox">
      {groupSessions?.map((groupSession) => (
        <GroupSessionCell
          groupSession={groupSession}
          key={groupSession.groupSessionId}
          week={week}
          tableEditMode={tableEditMode}
        />
      ))}
    </div>
  );
}
