import React from 'react';
import type { Call, Week } from '../../../../types/CoachingTypes';
import { useContextualMenu } from '../../../../hooks/useContextualMenu';
import useCoaching from '../../../../hooks/useCoaching';
import ContextualControlls from '../../../ContextualControlls';
export default function PrivateCallsCell({ week }: { week: Week }) {
  const {
    getPrivateCallsFromWeekRecordId,
    getStudentFromMembershipId,
    getMembershipFromWeekRecordId,
    getCourseFromMembershipId,
    dateObjectToText,
  } = useCoaching();
  // const call = getPrivateCallsFromWeekRecordId(week.recordId);
  const { contextual, setContextualRef, closeContextual, openContextual } =
    useContextualMenu();

  const calls = getPrivateCallsFromWeekRecordId(week.recordId);

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
                    <div className="lineWrapper">
                      <a target="_blank" href={call.recording}>
                        Recording Link
                      </a>
                    </div>
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
      {/* {weekGetsPrivateCalls(data.recordId) && ( */}
      {/*
      {week.membershipCourseWeeklyPrivateCalls > 0 && (
        <>
          <button
            type="button"
            className="greenButton"
            onClick={() => openContextual(`newCallForWeek${week.recordId}`)}
          >
            New
          </button>
          {/* New Call Popup 
          {contextual === `newCallForWeek${week.recordId}` && (
            <div className="contextualWrapper callPopup" ref={setContextualRef}>
              <div className="contextual">
                <h4>
                  {
                    getStudentFromMembershipId(
                      getMembershipFromWeekRecordId(week.recordId)?.recordId,
                    )?.fullName
                  }{' '}
                  {
                    getCourseFromMembershipId(
                      getMembershipFromWeekRecordId(week.recordId!)?.recordId,
                    )?.name
                  }{' '}
                  call on {dateObjectToText(new Date(Date.now()))}
                </h4>
                <label htmlFor="start">Start date:</label>
                <input
                  type="date"
                  id="start"
                  name="trip-start"
                  value={dateObjectToText(new Date(Date.now()))}
                  min="2018-01-01"
                  max="2026-12-31"
                />
                <p>Rating:</p>
                <select value="Fair">
                  <option value="Terrible">Terrible</option>
                  <option value="Poor">Poor</option>
                  <option value="Fair">Fair</option>
                  <option value="Good">Good</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Late Cancel">Late Cancel</option>
                  <option value="No-Show">No-Show</option>
                </select>
                <p>Notes:</p>
                <textarea />
                <p>Difficulties:</p>
                <textarea />
                <p>Recording Link</p>
                <textarea />
                <div className="buttonBox">
                  <button
                    type="button"
                    className="greenButton"
                    onClick={closeContextual}
                  >
                    Submit
                  </button>
                </div>
                <div className="buttonBox">
                  <button
                    type="button"
                    className="redButton"
                    onClick={closeContextual}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      */}
    </div>
  );
}
