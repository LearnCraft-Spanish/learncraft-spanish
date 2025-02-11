import React, { useState } from 'react';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import type { Call, Week } from 'src/types/CoachingTypes';
import ContextualControlls from 'src/components/ContextualControlls';
import usePrivateCalls from 'src/hooks/CoachingData/usePrivateCalls';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { useModal } from 'src/hooks/useModal';

import DeleteRecord from './general/DeleteRecord';

function PrivateCall({ call }: { call: Call }) {
  const {
    setContextualRef,
    openContextual,
    contextual,
    updateDisableClickOutside,
    closeContextual,
  } = useContextualMenu();
  const { getStudentFromMembershipId, getMembershipFromWeekRecordId } =
    useCoaching();
  const { updatePrivateCallMutation } = usePrivateCalls();
  const { coachListQuery } = useCoaching();
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
    if (!caller) {
      openModal({
        title: 'Error',
        body: 'Caller is a required field',
        type: 'error',
      });
      return;
    }
    if (!rating) {
      openModal({
        title: 'Error',
        body: 'Rating is a required field',
        type: 'error',
      });
      return;
    }
    if (!date) {
      openModal({
        title: 'Error',
        body: 'Date is a required field',
        type: 'error',
      });
      return;
    }
    updatePrivateCallMutation.mutate({
      ...call,
      rating,
      notes,
      areasOfDifficulty,
      recording,
      date,
      caller,
      callType,
    });
    disableEditMode();
  }

  function deleteRecordFunction() {
    console.error('Delete Record Function, not impletemented yet');
    closeModal();
    cancelEdit();
    closeContextual();
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
    <div className="cellWithContextual" key={call.recordId}>
      <button
        type="button"
        onClick={() => openContextual(`call${call.recordId}`)}
      >
        {call.rating}
      </button>
      {contextual === `call${call.recordId}` && (
        <div className="contextualWrapper">
          <div className="contextual" ref={setContextualRef}>
            <ContextualControlls editFunction={enableEditMode} />
            {editMode ? (
              <h4>Edit Call</h4>
            ) : (
              <h4>
                {
                  getStudentFromMembershipId(
                    getMembershipFromWeekRecordId(call.relatedWeek)?.recordId,
                  )?.fullName
                }{' '}
                on{' '}
                {typeof call.date === 'string'
                  ? call.date
                  : call.date.toString()}
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
            <div className="lineWrapper">
              <label className="label" htmlFor="caller">
                Caller:
              </label>
              {editMode ? (
                <select
                  className="content"
                  id="caller"
                  name="caller"
                  defaultValue={caller}
                  onChange={(e) => setCaller(e.target.value)}
                >
                  <option value="">Select</option>
                  {coachListQuery.data?.map((coach) => (
                    <option key={coach.coach} value={coach.user.email}>
                      {coach.user.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="content">{call.caller.name}</p>
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
            <div className="lineWrapper">
              <label className="label" htmlFor="rating">
                Rating:
              </label>
              {editMode ? (
                <select
                  className="content"
                  id="rating"
                  name="rating"
                  defaultValue={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Bad">Bad</option>
                  <option value="Late Cancel">Late Cancel</option>
                  <option value="No-Show">No-Show</option>
                </select>
              ) : (
                <p className="content">{call.rating}</p>
              )}
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="notes">
                Notes:
              </label>
              {editMode ? (
                <textarea
                  className="content"
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              ) : (
                <p className="content">{call.notes}</p>
              )}
            </div>
            {/* <div className="lineWrapper">
              <p className="label">Difficulties: </p>
              <p className="content"> {call.areasOfDifficulty}</p>
            </div> */}
            <div className="lineWrapper">
              <label className="label" htmlFor="areasOfDifficulty">
                Difficulties:
              </label>
              {editMode ? (
                <textarea
                  className="content"
                  id="areasOfDifficulty"
                  name="areasOfDifficulty"
                  value={areasOfDifficulty}
                  onChange={(e) => setAreasOfDifficulty(e.target.value)}
                />
              ) : (
                <p className="content">{call.areasOfDifficulty}</p>
              )}
            </div>
            {editMode ? (
              <div className="lineWrapper">
                <label className="label" htmlFor="recording">
                  Recording Link:
                </label>
                <input
                  className="content"
                  type="text"
                  id="recording"
                  name="recording"
                  value={recording}
                  onChange={(e) => setRecording(e.target.value)}
                />
              </div>
            ) : (
              call.recording.length > 0 && (
                <div className="lineWrapper">
                  <a target="_blank" href={call.recording}>
                    Recording Link
                  </a>
                </div>
              )
            )}
            <div className="lineWrapper">
              <label className="label">Call Type</label>
              {editMode ? (
                <select
                  className="content"
                  name="callType"
                  id="callType"
                  defaultValue={callType}
                  onChange={(e) => setCallType(e.target.value)}
                >
                  <option value="Monthly Call">Monthly Call</option>
                  <option value="Uses Credit (Bundle)">
                    Uses Credit (Bundle)
                  </option>
                </select>
              ) : (
                <p className="content">{call.callType}</p>
              )}
            </div>
            {editMode && <DeleteRecord deleteFunction={deleteRecordFunction} />}

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
    </div>
  );
}

export default function PrivateCallsCell({
  week,
  calls,
}: {
  week: Week;
  calls: Call[] | null;
}) {
  const { getStudentFromMembershipId } = useCoaching();
  const { contextual, setContextualRef, openContextual, closeContextual } =
    useContextualMenu();
  const userDataQuery = useUserData();
  const { createPrivateCallMutation } = usePrivateCalls();
  const { coachListQuery } = useCoaching();
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
    if (!caller) {
      openModal({
        title: 'Error',
        body: 'Caller is a required field',
        type: 'error',
      });
      return;
    }
    if (!rating) {
      openModal({
        title: 'Error',
        body: 'Rating is a required field',
        type: 'error',
      });
      return;
    }
    if (!date) {
      openModal({
        title: 'Error',
        body: 'Date is a required field',
        type: 'error',
      });
      return;
    }
    createPrivateCallMutation.mutate({
      relatedWeek: week.recordId,
      rating,
      notes,
      areasOfDifficulty,
      recording,
      callType,
      date,
      caller,
    });
    // add toasts here as well
    closeContextual();
  }

  return (
    <div className="callBox">
      {/* Existing Calls */}
      {calls &&
        calls.map((call) => <PrivateCall key={call.recordId} call={call} />)}
      {/* New Call Form */}
      <button
        type="button"
        className="greenButton"
        onClick={() => openContextual(`addPrivateCall${week.recordId}`)}
      >
        New
      </button>
      {contextual === `addPrivateCall${week.recordId}` && (
        <div className="contextualWrapper callPopup">
          <div className="contextual" ref={setContextualRef}>
            <ContextualControlls />
            <h4>
              {getStudentFromMembershipId(week.relatedMembership)?.fullName} on{' '}
              {new Date(Date.now()).toISOString().split('T')[0]}
            </h4>
            <div className="lineWrapper">
              <label className="label" htmlFor="rating">
                Rating:
              </label>
              <select
                className="content"
                id="rating"
                name="rating"
                defaultValue={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Bad">Bad</option>
                <option value="Late Cancel">Late Cancel</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="caller">
                Caller:
              </label>
              <select
                className="content"
                id="caller"
                name="caller"
                defaultValue={caller}
                onChange={(e) => setCaller(e.target.value)}
              >
                <option value="">Select</option>
                {coachListQuery.data?.map((coach) => (
                  <option key={coach.coach} value={coach.user.email}>
                    {coach.user.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lineWrapper">
              <label className="label">Date: </label>
              <input
                className="content"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="notes">
                Notes:{' '}
              </label>
              <textarea
                className="content"
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="areasOfDifficulty">
                Difficulties:{' '}
              </label>
              <textarea
                className="content"
                id="areasOfDifficulty"
                name="areasOfDifficulty"
                value={areasOfDifficulty}
                onChange={(e) => setAreasOfDifficulty(e.target.value)}
              />
            </div>
            <div className="lineWrapper">
              <label className="label" htmlFor="recording">
                Recording Link:{' '}
              </label>
              <input
                className="content"
                type="text"
                id="recording"
                name="recording"
                value={recording}
                onChange={(e) => setRecording(e.target.value)}
              />
            </div>
            <div className="lineWrapper">
              <label className="label">Call Type</label>
              <select
                className="content"
                name="callType"
                id="callType"
                defaultValue={callType}
                onChange={(e) => setCallType(e.target.value)}
              >
                <option value="Monthly Call">Monthly Call</option>
                <option value="Uses Credit (Bundle)">
                  Uses Credit (Bundle)
                </option>
              </select>
            </div>
            <div className="buttonBox">
              <button
                type="button"
                className="redButton"
                onClick={closeContextual}
              >
                Cancel
              </button>
              <button
                type="button"
                className="greenButton"
                onClick={createNewPrivateCall}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
