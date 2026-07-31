import type {
  BasePrivateCall,
  FurnishedWeekWithCoach,
  PrivateCallRating,
  PrivateCallType,
} from '@learncraft-spanish/shared';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import { usePrivateCallLookupsQuery } from '@application/queries/PrivateCallQueries/usePrivateCallLookupsQuery';
import { usePrivateCallMutations } from '@application/queries/PrivateCallQueries/usePrivateCallMutations';
import { Dropdown } from '@interface/components/FormComponents';
import { useEffect, useState } from 'react';
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
import { toReadableMonthDay } from 'src/hexagon/domain/functions/dateUtils';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';

function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) {
    return '';
  }

  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  return date.split('T')[0];
}

function PrivateCallInstance({
  week,
  call,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  call: BasePrivateCall;
  tableEditMode: boolean;
}) {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual" key={call.callId}>
      <button
        type="button"
        onClick={() => openContextual(`call${call.callId}`)}
      >
        {call.callRating?.rating || 'No Rating'}
      </button>
      {contextual === `call${call.callId}` && (
        <PrivateCallView
          week={week}
          call={call}
          tableEditMode={tableEditMode}
        />
      )}
    </div>
  );
}

export function PrivateCallView({
  week,
  call,
  tableEditMode,
  onSuccess,
}: {
  week: FurnishedWeekWithCoach;
  call: BasePrivateCall;
  tableEditMode: boolean;
  onSuccess?: () => void;
}) {
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

    setCaller(call.caller.coach_id);
    setDate(formatDateInput(call.callDate));
    setCallRating(call.callRating);
    setCallType(call.callType);
    setNotes(call.notes || '');
    setAreasOfDifficulty(call.areasOfDifficulty || '');
    setRecording(call.recording || '');
  }

  function submitEdit() {
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

  function deleteRecordFunction() {
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

  function captureSubmitForm() {
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
          {week.student?.fullName || 'No Student'} on{' '}
          {toReadableMonthDay(formatDateInput(call.callDate))}
        </h4>
      )}
      {editMode && (
        <div className="lineWrapper">
          <p className="label">Student: </p>
          <p>{week.student?.fullName || 'No Student'}</p>
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

export default function PrivateCallsCell({
  week,
  calls,
  tableEditMode,
}: {
  week: FurnishedWeekWithCoach;
  calls: BasePrivateCall[] | null;
  tableEditMode: boolean;
}) {
  const { contextual, openContextual } = useContextualMenu();
  return (
    <div className="callBox">
      {/* Existing Calls */}
      {calls &&
        calls.map((call) => (
          <PrivateCallInstance
            key={call.callId}
            week={week}
            call={call}
            tableEditMode={tableEditMode}
          />
        ))}
      {/* New Call Form */}
      {!tableEditMode && (
        <button
          type="button"
          className="greenButton"
          onClick={() => openContextual(`addPrivateCall${week.weekId}`)}
        >
          New
        </button>
      )}
      {contextual === `addPrivateCall${week.weekId}` && (
        <NewPrivateCallView week={week} />
      )}
    </div>
  );
}

export function NewPrivateCallView({
  onSuccess,
  week,
}: {
  onSuccess?: () => void;
  week: FurnishedWeekWithCoach;
}) {
  const { createPrivateCallMutation } = usePrivateCallMutations();
  const { callRatings, callTypes } = usePrivateCallLookupsQuery();
  const { closeContextual, openContextual } = useContextualMenu();
  const { authUser } = useAuthAdapter();
  const { openModal } = useModal();
  const { coaches } = useAllCoachesQuery();

  const defaultCaller =
    coaches?.find((coach) => coach.email === authUser.email)?.coach_id || 0;

  const [caller, setCaller] = useState(defaultCaller);
  const [date, setDate] = useState(
    new Date(Date.now()).toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState('');
  const [areasOfDifficulty, setAreasOfDifficulty] = useState('');
  const [recording, setRecording] = useState('');
  const [callRating, setCallRating] = useState<PrivateCallRating>();
  const [callType, setCallType] = useState<PrivateCallType>();
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    if (caller === 0 && defaultCaller !== 0) {
      setCaller(defaultCaller);
    }
  }, [caller, defaultCaller]);

  useEffect(() => {
    if (!callType && callTypes && callTypes.length > 0) {
      setCallType(
        callTypes.find((type) => type.callType === 'Monthly Call') ||
          callTypes[0],
      );
    }
  }, [callType, callTypes]);

  function createNewPrivateCall() {
    const badInput = verifyRequiredInputs([
      { value: callRating?.rating || '', label: 'Rating' },
      { value: date, label: 'Date' },
      { value: caller ? String(caller) : '', label: 'Caller' },
      { value: callType?.callType || '', label: 'Call Type' },
    ]);
    if (badInput) {
      openModal({
        title: 'Error',
        body: `${badInput} is a required field`,
        type: 'error',
      });
      return;
    }
    if (!callRating || !callType) {
      openModal({
        title: 'Error',
        body: 'Rating and Call Type are required',
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
    setEditMode(false);
    createPrivateCallMutation.mutate(
      {
        weekId: week.weekId,
        callRating,
        callType,
        caller,
        callDate: date,
        notes,
        areasOfDifficulty,
        recording,
      },
      {
        onSuccess: (newPrivateCall) => {
          onSuccess?.();
          openContextual(`call${newPrivateCall.callId}`);
        },
      },
    );
  }

  function toggleEditMode() {
    if (editMode) {
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  }

  return (
    <ContextualView editFunction={toggleEditMode}>
      {editMode ? (
        <h4>Create Call</h4>
      ) : (
        <h4>
          {week.student?.fullName || 'No Student'} on {toReadableMonthDay(date)}
        </h4>
      )}
      {editMode && (
        <div className="lineWrapper">
          <label htmlFor="privateCallName" className="label">
            Private Call:
          </label>
          <div className="content" id="privateCallName">
            {formatDateInput(week.weekStarts)} -{' '}
            {week.student?.fullName || 'No Student'}
          </div>
        </div>
      )}
      {editMode && (
        <div className="lineWrapper">
          <label className="label" htmlFor="student">
            Student:
          </label>
          <div className="content" id="student">
            {week.student?.fullName || 'No Student'}
          </div>
        </div>
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

      <CoachDropdown
        label="Caller"
        coachId={caller}
        onChange={setCaller}
        editMode={editMode}
        required
      />

      <DateInput value={date} onChange={setDate} required editMode={editMode} />

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
        required
      />

      <FormControls
        captureSubmitForm={createNewPrivateCall}
        cancelEdit={() => closeContextual()}
        editMode={editMode}
      />
    </ContextualView>
  );
}
