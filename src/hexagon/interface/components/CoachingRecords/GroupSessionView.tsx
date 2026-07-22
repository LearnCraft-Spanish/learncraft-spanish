import type { AttendeeSelection } from '@interface/components/CoachingRecords/helpers';
import type {
  BaseGroupSession,
  GroupSessionTopic,
  GroupSessionType,
} from '@learncraft-spanish/shared';

import type { SetStateAction } from 'react';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useGroupCallMutations } from '@application/queries/GroupCallQueries/useGroupCallMutations';
import { useGroupCallLookupsQuery } from '@application/queries/useGroupCallLookupsQuery';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { toReadableMonthDay } from '@domain/functions/dateUtils';
import {
  formatDateInputWithDefault,
  getSortedWeekIds,
  getWeekStartsFromDate,
  hasSameAttendeeWeekIds,
  remapAttendeesByName,
} from '@interface/components/CoachingRecords/helpers';
import ContextualView from '@interface/components/Contextual/ContextualView';
import { Dropdown } from '@interface/components/FormComponents';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useModal } from '@interface/hooks/useModal';
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

export function GroupSessionView({
  groupSession,
  tableEditMode,
  onSuccess,
}: {
  groupSession: BaseGroupSession;
  tableEditMode: boolean;
  onSuccess?: () => void;
}): React.JSX.Element {
  const { isAdmin } = useAuthAdapter();
  const { closeContextual, updateDisableClickOutside } = useContextualMenu();
  const { closeModal, openModal } = useModal();
  const { updateGroupCallMutation, deleteGroupCallMutation } =
    useGroupCallMutations();
  const { groupSessionTypes, groupSessionTopics } = useGroupCallLookupsQuery();

  const [editMode, setEditMode] = useState(false);
  const [coachId, setCoachId] = useState(groupSession.coach.coach_id);
  const [date, setDate] = useState(
    formatDateInputWithDefault(groupSession.callDate),
  );
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

  function resetState(): void {
    setCoachId(groupSession.coach.coach_id);
    setDate(formatDateInputWithDefault(groupSession.callDate));
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

  function enableEditMode(): void {
    setEditMode(true);
    updateDisableClickOutside(true);
  }

  function disableEditMode(): void {
    setEditMode(false);
    updateDisableClickOutside(false);
  }

  function cancelEdit(): void {
    disableEditMode();
    resetState();
  }

  function toggleEditMode(): void {
    if (editMode) {
      cancelEdit();
    } else {
      enableEditMode();
    }
  }

  function addAttendee(weekId: number): void {
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

  function applyDateChange(nextDate: string): void {
    setPendingAttendeeRemapNames(
      attendees.map((attendee) => attendee.studentFullName),
    );
    setDate(nextDate);
  }

  function updateDate(value: SetStateAction<string>): void {
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

  function removeAttendee(weekId: number): void {
    setAttendees((prev) =>
      prev.filter((attendee) => attendee.weekId !== weekId),
    );
  }

  function deleteRecordFunction(): void {
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

  function hasInputChanges(): boolean {
    return (
      coachId !== groupSession.coach.coach_id ||
      date !== formatDateInputWithDefault(groupSession.callDate) ||
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

  function captureSubmitForm(): void {
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
            (topicOption) => topicOption.groupSessionTopic === value,
          );
          if (!selectedTopic) {
            console.error('No group session topic found with value:', value);
            return;
          }
          setTopic(selectedTopic);
        }}
        options={
          groupSessionTopics?.map(
            (topicOption) => topicOption.groupSessionTopic,
          ) || []
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
