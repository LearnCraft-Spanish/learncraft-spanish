import React from 'react';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import useCoaching from 'src/hooks/CoachingData/useCoaching';
import type { Week } from 'src/types/CoachingTypes';
import ContextualControlls from 'src/components/ContextualControlls';
import usePrivateCalls from 'src/hooks/CoachingData/usePrivateCalls';
import { useUserData } from 'src/hooks/UserData/useUserData';

export default function PrivateCallsCell({ week }: { week: Week }) {
  const {
    getPrivateCallsFromWeekRecordId,
    getStudentFromMembershipId,
    getMembershipFromWeekRecordId,
  } = useCoaching();
  // const call = getPrivateCallsFromWeekRecordId(week.recordId);
  const { contextual, setContextualRef, openContextual, closeContextual } =
    useContextualMenu();
  const userData = useUserData();

  const { createPrivateCallMutation } = usePrivateCalls();

  const calls = getPrivateCallsFromWeekRecordId(week.recordId);

  function createNewPrivateCall() {
    // createPrivateCallMutation.mutate({
    //   relatedWeek: week.recordId,
    //   rating: 'Fair',
    //   notes: 'Notes',
    //   areasOfDifficulty: 'Difficulty',
    //   recording: 'Recording',
    //   callType: 'Monthly Call',
    // });

    console.log('Creating new private call');
    closeContextual();
  }

  return (
    <div className="callBox">
      {/* View Call Popup */}
      {calls &&
        calls.map((call) => (
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
                  <ContextualControlls />
                  <h4>
                    {
                      getStudentFromMembershipId(
                        getMembershipFromWeekRecordId(week.recordId)?.recordId,
                      )?.fullName
                    }{' '}
                    on{' '}
                    {typeof call.date === 'string'
                      ? call.date
                      : call.date.toString()}
                  </h4>
                  <div className="lineWrapper">
                    <p className="label">Rating: </p>
                    <p className="content">{call.rating}</p>
                  </div>
                  <div className="lineWrapper">
                    <p className="label">Notes: </p>
                    <p className="content">{call.notes}</p>
                  </div>
                  <div className="lineWrapper">
                    <p className="label">Difficulties: </p>
                    <p className="content"> {call.areasOfDifficulty}</p>
                  </div>
                  {call.recording.length > 0 && (
                    <>
                      <div className="lineWrapper">
                        <h4>Session Documents:</h4>
                      </div>
                      <div className="lineWrapper">
                        <a target="_blank" href={call.recording}>
                          Recording Link
                        </a>
                      </div>
                    </>
                  )}
                  {/* <div className="buttonBox">
                    <button
                      type="button"
                      className="redButton"
                      onClick={closeContextual}
                    >
                      Close
                    </button>
                  </div> */}
                </div>
              </div>
            )}
          </div>
        ))}
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
              <p className="label">Rating: </p>
              <select defaultValue="">
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
              <p className="label">Caller: </p>
              <p>{userData.data?.name}</p>
            </div>
            <div className="lineWrapper">
              <p className="label">Date: </p>
              <input
                type="date"
                value={new Date(Date.now()).toISOString().split('T')[0]}
                readOnly
              />
            </div>
            <div className="lineWrapper">
              <p className="label">Notes: </p>
              <textarea />
            </div>
            <div className="lineWrapper">
              <p className="label">Difficulties: </p>
              <textarea />
            </div>
            <div className="lineWrapper">
              <p className="label">Recording Link: </p>
              <textarea />
            </div>
            <div className="lineWrapper">
              <p className="label">Call Type</p>
              <select
                name="callType"
                id="callType"
                defaultValue={'Monthly Call'}
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
