import type { PrivateCall, Week } from 'src/types/CoachingTypes';
import React, { useState } from 'react';
import ContextualView from 'src/components/Contextual/ContextualView';
import {
  CoachDropdown,
  DateInput,
  DeleteRecord,
  Dropdown,
  FormControls,
  LinkInput,
  TextAreaInput,
  verifyRequiredInputs,
} from 'src/components/FormComponents';
import { isValidUrl } from 'src/components/FormComponents/functions/inputValidation';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useModal } from 'src/hooks/useModal';
import { useUserData } from 'src/hooks/UserData/useUserData';

const ratingOptions = [
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'Poor',
  'Bad',
  'Late Cancel',
  'No-Show',
];
const callTypeOptions = ['Monthly Call', 'Uses Credit (Bundle)'];
function PrivateCallInstance({
  call,
  tableEditMode,
}: {
  call: PrivateCall;
  tableEditMode: boolean;
}) {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual" key={call.recordId}>
      <button
        type="button"
        onClick={() => openContextual(`call${call.recordId}`)}
      >
        {call.rating}
      </button>
      {contextual === `call${call.recordId}` && (
        <PrivateCallView call={call} tableEditMode={tableEditMode} />
      )}
    </div>
  );
}

export function PrivateCallView({
  call,
  tableEditMode,
}: {
  call: PrivateCall;
  tableEditMode?: boolean;
}) {
  const userDataQuery = useUserData();
  const { updateDisableClickOutside, closeContextual } = useContextualMenu();
  const {
    getStudentFromMembershipId,
    getMembershipFromWeekRecordId,
    updatePrivateCallMutation,
    deletePrivateCallMutation,
  } = useCoaching();

  const { openModal, closeModal } = useModal();

  const [editMode, setEditMode] = useState(false);
  // inputs & defaults
  const [rating, setRating] = useState(call.rating);
  const [caller, setCaller] = useState(call.caller.email || '');
  const [date, setDate] = useState(
    new Date(call.date).toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState(call.notes);
  const [areasOfDifficulty, setAreasOfDifficulty] = useState(
    call.areasOfDifficulty,
  );
  const [callType, setCallType] = useState(call.callType);
  const [recording, setRecording] = useState(call.recording);

  function enableEditMode() {
    setEditMode(true);
    updateDisableClickOutside(true);
  }
  function disableEditMode() {
    setEditMode(false);
    updateDisableClickOutside(false);
  }

  function toggleEditMode() {
    if (editMode) {
      cancelEdit();
    } else {
      enableEditMode();
    }
  }

  function cancelEdit() {
    disableEditMode();

    setRating(call.rating);
    setNotes(call.notes);
    setAreasOfDifficulty(call.areasOfDifficulty);
    setRecording(call.recording);
    setDate(new Date(call.date).toISOString().split('T')[0]);
    setCaller(call.caller.email);
    setCallType(call.callType);
  }

  function submitEdit() {
    // Verify inputs
    const badInput = verifyRequiredInputs([
      { value: rating, label: 'Rating' },
      { value: date, label: 'Date' },
      { value: caller, label: 'Caller' },
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
        ...call,
        rating,
        notes,
        areasOfDifficulty,
        recording,
        date,
        caller,
        callType,
      },
      {
        onSuccess: () => {
          disableEditMode();
        },
      },
    );
  }

  function deleteRecordFunction() {
    deletePrivateCallMutation.mutate(call.recordId, {
      onSuccess: () => {
        closeModal();
        cancelEdit();
        closeContextual();
      },
    });
  }

  function captureSubmitForm() {
    // check if fields have changed from original call
    // if not, do nothing
    if (
      call.rating === rating &&
      call.notes === notes &&
      call.areasOfDifficulty === areasOfDifficulty &&
      call.recording === recording &&
      call.date === date &&
      call.caller.email === caller
    ) {
      cancelEdit();
      return;
    }
    // if they have, submit the form
    submitEdit();
  }

  return (
    <ContextualView editFunction={tableEditMode ? undefined : toggleEditMode}>
      {editMode ? (
        <h4>Edit Call</h4>
      ) : (
        <h4>
          {
            getStudentFromMembershipId(
              getMembershipFromWeekRecordId(call.relatedWeek)?.recordId,
            )?.fullName
          }{' '}
          on {typeof call.date === 'string' ? call.date : call.date.toString()}
        </h4>
      )}
      {editMode && (
        <div className="lineWrapper">
          <p className="label">Student: </p>
          <p>
            {
              getStudentFromMembershipId(
                getMembershipFromWeekRecordId(call.relatedWeek)?.recordId,
              )?.fullName
            }
          </p>
        </div>
      )}

      <CoachDropdown
        label="Caller"
        coachEmail={caller}
        onChange={setCaller}
        editMode={editMode}
      />

      {editMode && <DateInput value={date} onChange={setDate} />}

      <Dropdown
        label="Rating"
        value={rating}
        onChange={setRating}
        options={ratingOptions}
        editMode={editMode}
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
        value={callType}
        onChange={setCallType}
        options={callTypeOptions}
        editMode={editMode}
      />

      {editMode && userDataQuery.data?.roles.adminRole === 'admin' && (
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

export default function PrivateCallsCell({
  week,
  calls,
  tableEditMode,
}: {
  week: Week;
  calls: PrivateCall[] | null;
  tableEditMode: boolean;
}) {
  const { getStudentFromMembershipId, createPrivateCallMutation } =
    useCoaching();
  const { contextual, openContextual, closeContextual } = useContextualMenu();
  const userDataQuery = useUserData();
  const { openModal } = useModal();

  // New Record Inputs
  const [caller, setCaller] = useState(userDataQuery.data?.emailAddress || '');
  const [rating, setRating] = useState('');
  const [date, setDate] = useState(
    new Date(Date.now()).toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState('');
  const [areasOfDifficulty, setAreasOfDifficulty] = useState('');
  const [recording, setRecording] = useState('');
  const [callType, setCallType] = useState('Monthly Call');

  function createNewPrivateCall() {
    // Verify inputs
    const badInput = verifyRequiredInputs([
      { value: rating, label: 'Rating' },
      { value: date, label: 'Date' },
      { value: caller, label: 'Caller' },
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

    createPrivateCallMutation.mutate(
      {
        relatedWeek: week.recordId,
        rating,
        notes,
        areasOfDifficulty,
        recording,
        callType,
        date,
        caller,
      },
      {
        onSuccess: () => {
          closeContextual();

          // Reset State
          setRating('');
          setNotes('');
          setAreasOfDifficulty('');
          setRecording('');
          setDate(new Date(Date.now()).toISOString().split('T')[0]);
          setCaller(userDataQuery.data?.emailAddress || '');
          setCallType('Monthly Call');
        },
      },
    );
  }

  return (
    <div className="callBox">
      {/* Existing Calls */}
      {calls &&
        calls.map((call) => (
          <PrivateCallInstance
            key={call.recordId}
            call={call}
            tableEditMode={tableEditMode}
          />
        ))}
      {/* New Call Form */}
      {!tableEditMode && (
        <button
          type="button"
          className="greenButton"
          onClick={() => openContextual(`addPrivateCall${week.recordId}`)}
        >
          New
        </button>
      )}
      {contextual === `addPrivateCall${week.recordId}` && (
        <ContextualView>
          <h4>
            {getStudentFromMembershipId(week.relatedMembership)?.fullName} on{' '}
            {new Date(Date.now()).toISOString().split('T')[0]}
          </h4>
          <Dropdown
            label="Rating"
            value={rating}
            onChange={setRating}
            options={ratingOptions}
            editMode
          />

          <CoachDropdown
            label="Caller"
            coachEmail={caller}
            onChange={setCaller}
            editMode
          />

          <DateInput value={date} onChange={setDate} />

          <TextAreaInput
            label="Notes"
            value={notes}
            onChange={setNotes}
            editMode
          />

          <TextAreaInput
            label="Difficulties"
            value={areasOfDifficulty}
            onChange={setAreasOfDifficulty}
            editMode
          />

          <LinkInput
            label="Recording Link"
            value={recording}
            onChange={setRecording}
            editMode
          />

          <Dropdown
            label="Call Type"
            value={callType}
            onChange={setCallType}
            options={callTypeOptions}
            editMode
          />

          <FormControls
            captureSubmitForm={createNewPrivateCall}
            cancelEdit={() => closeContextual()}
            editMode
          />
        </ContextualView>
      )}
    </div>
  );
}
