import type { CoachingRecordDisplayContext } from '@interface/components/CoachingRecords/types';
import type { BasePrivateCall } from '@learncraft-spanish/shared';

import { useAuthAdapter } from '@application/adapters/authAdapter';
import { usePrivateCallLookupsQuery } from '@application/queries/PrivateCallQueries/usePrivateCallLookupsQuery';
import { usePrivateCallMutations } from '@application/queries/PrivateCallQueries/usePrivateCallMutations';
import { toReadableMonthDay } from '@domain/functions/dateUtils';
import { formatDateInput } from '@interface/components/CoachingRecords/helpers';
import ContextualView from '@interface/components/Contextual/ContextualView';
import { Dropdown } from '@interface/components/FormComponents';
import { useContextualMenu } from '@interface/hooks/useContextualMenu';
import { useModal } from '@interface/hooks/useModal';
import { useState } from 'react';
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

export function PrivateCallView({
  call,
  displayContext,
  tableEditMode,
  onSuccess,
}: {
  call: BasePrivateCall;
  displayContext?: CoachingRecordDisplayContext;
  tableEditMode: boolean;
  onSuccess?: () => void;
}): React.JSX.Element {
  const studentName = displayContext?.studentName ?? 'No Student';
  const { isAdmin } = useAuthAdapter();
  const { updateDisableClickOutside, closeContextual } = useContextualMenu();
  const { updatePrivateCallMutation, deletePrivateCallMutation } =
    usePrivateCallMutations();
  const { callRatings, callTypes } = usePrivateCallLookupsQuery();
  const { openModal, closeModal } = useModal();

  const [editMode, setEditMode] = useState(false);
  const [caller, setCaller] = useState(call.caller.coach_id);
  const [date, setDate] = useState(formatDateInput(call.callDate));
  const [callRating, setCallRating] = useState(call.callRating);
  const [callType, setCallType] = useState(call.callType);
  const [notes, setNotes] = useState(call.notes || '');
  const [areasOfDifficulty, setAreasOfDifficulty] = useState(
    call.areasOfDifficulty || '',
  );
  const [recording, setRecording] = useState(call.recording || '');

  function enableEditMode(): void {
    setEditMode(true);
    updateDisableClickOutside(true);
  }

  function disableEditMode(): void {
    setEditMode(false);
    updateDisableClickOutside(false);
  }

  function toggleEditMode(): void {
    if (editMode) {
      cancelEdit();
    } else {
      enableEditMode();
    }
  }

  function cancelEdit(): void {
    disableEditMode();
    setCaller(call.caller.coach_id);
    setDate(formatDateInput(call.callDate));
    setCallRating(call.callRating);
    setCallType(call.callType);
    setNotes(call.notes || '');
    setAreasOfDifficulty(call.areasOfDifficulty || '');
    setRecording(call.recording || '');
  }

  function submitEdit(): void {
    const badInput = verifyRequiredInputs([
      { value: callRating?.rating || '', label: 'Rating' },
      { value: date, label: 'Date' },
      { value: caller ? String(caller) : '', label: 'Caller' },
    ]);
    if (badInput) {
      openModal({
        title: 'Error',
        body: `${badInput} is a required field`,
        type: 'error',
      });
      return;
    }
    if (recording && !isValidUrl(recording)) {
      openModal({
        title: 'Error',
        body: 'Recording Link must be a valid url',
        type: 'error',
      });
      return;
    }
    updatePrivateCallMutation.mutate(
      {
        callId: call.callId,
        weekId: call.weekId,
        callRating,
        callType,
        caller,
        callDate: date,
        notes,
        areasOfDifficulty,
        recording,
      },
      {
        onSuccess: () => {
          disableEditMode();
          onSuccess?.();
        },
      },
    );
  }

  function deleteRecordFunction(): void {
    deletePrivateCallMutation.mutate(
      { callId: call.callId },
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

  function captureSubmitForm(): void {
    if (
      call.caller.coach_id === caller &&
      formatDateInput(call.callDate) === date &&
      call.callRating.callRatingId === callRating.callRatingId &&
      call.callType?.callTypeId === callType?.callTypeId &&
      (call.notes || '') === notes &&
      (call.areasOfDifficulty || '') === areasOfDifficulty &&
      (call.recording || '') === recording
    ) {
      cancelEdit();
      return;
    }
    submitEdit();
  }

  return (
    <ContextualView editFunction={tableEditMode ? undefined : toggleEditMode}>
      {editMode ? (
        <h4>Edit Call</h4>
      ) : (
        <h4>
          {studentName} on {toReadableMonthDay(formatDateInput(call.callDate))}
        </h4>
      )}
      {editMode && (
        <div className="lineWrapper">
          <p className="label">Student: </p>
          <p>{studentName}</p>
        </div>
      )}

      <CoachDropdown
        label="Caller"
        coachId={caller}
        onChange={setCaller}
        editMode={editMode}
        required
      />

      {editMode && (
        <DateInput value={date} onChange={setDate} required editMode />
      )}

      <Dropdown
        label="Rating"
        value={callRating?.rating || ''}
        onChange={(value) => {
          const selectedRating = callRatings?.find(
            (rating) => rating.rating === value,
          );
          if (!selectedRating) {
            console.error('No private call rating found with value:', value);
            return;
          }
          setCallRating(selectedRating);
        }}
        options={callRatings?.map((rating) => rating.rating) || []}
        editMode={editMode}
        required
      />

      <TextAreaInput
        label="Notes"
        value={notes}
        onChange={setNotes}
        editMode={editMode}
      />

      <TextAreaInput
        label="Difficulties"
        value={areasOfDifficulty}
        onChange={setAreasOfDifficulty}
        editMode={editMode}
      />

      <LinkInput
        label="Recording Link"
        value={recording}
        onChange={setRecording}
        editMode={editMode}
      />

      <Dropdown
        label="Call Type"
        value={callType?.callType || ''}
        onChange={(value) => {
          const selectedCallType = callTypes?.find(
            (type) => type.callType === value,
          );
          if (!selectedCallType) {
            console.error('No private call type found with value:', value);
            return;
          }
          setCallType(selectedCallType);
        }}
        options={callTypes?.map((type) => type.callType) || []}
        editMode={editMode}
      />

      {editMode && isAdmin && (
        <DeleteRecord deleteFunction={deleteRecordFunction} />
      )}

      <FormControls
        captureSubmitForm={captureSubmitForm}
        cancelEdit={cancelEdit}
        editMode={editMode}
      />
    </ContextualView>
  );
}
