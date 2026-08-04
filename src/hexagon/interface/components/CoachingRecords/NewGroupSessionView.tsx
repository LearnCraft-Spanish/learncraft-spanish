import type { AttendeeSelection } from '@interface/components/CoachingRecords/helpers';
import type {
  Coach,
  GroupSessionTopic,
  GroupSessionType,
} from '@learncraft-spanish/shared';

import type { SetStateAction } from 'react';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import { useGroupCallMutations } from '@application/queries/GroupCallQueries/useGroupCallMutations';
import { useGroupCallLookupsQuery } from '@application/queries/useGroupCallLookupsQuery';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { toReadableMonthDay } from '@domain/functions/dateUtils';
import {
  getSortedWeekIds,
  getWeekStartsFromDate,
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
  FormControls,
  LinkInput,
  TextAreaInput,
  verifyRequiredInputs,
} from 'src/components/FormComponents';
import { isValidUrl } from 'src/components/FormComponents/functions/inputValidation';

function getDefaultCoachId(
  coaches: Coach[] | undefined,
  email: string,
): number {
  return coaches?.find((coach) => coach.email === email)?.coach_id || 0;
}

export function NewGroupSessionView({
  onSuccess,
  weekStartsDefaultValue,
}: {
  onSuccess?: () => void;
  weekStartsDefaultValue: string;
}): React.JSX.Element {
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

  function updateDate(value: SetStateAction<string>): void {
    setDate(value);
    setAttendees([]);
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

  function removeAttendee(weekId: number): void {
    setAttendees((prev) =>
      prev.filter((attendee) => attendee.weekId !== weekId),
    );
  }

  function createNewGroupSession(): void {
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

  function toggleEditMode(): void {
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
