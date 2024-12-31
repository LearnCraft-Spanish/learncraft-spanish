export default function CallsCell({ data }) {
  // Gets straight up weeks data for some reason
  const callData = getPrivateCallsFromWeekId(data.recordId);
  const callPopups = (data) => {
    if (data.length === 0) {
      return null;
    } else {
      return data.map((call) => (
        <div className="assignmentBox" key={call.recordId}>
          <button type="button" onClick={() => openCallPopup(call.recordId)}>
            {call.rating}
          </button>
          {contextual === `call${call.recordId}` && (
            <div className="callPopup" ref={setContextualRef}>
              <h4>
                {
                  getStudentFromMembershipId(
                    getMembershipFromWeekId(call.relatedWeek).recordId,
                  ).fullName
                }{' '}
                on {call.date}
              </h4>
              <p>
                Rating:
                {call.rating}
              </p>
              <p>
                Notes:
                {call.notes}
              </p>
              <p>
                Difficulties:
                {call.areasOfDifficulty}
              </p>
              {call.recording.length > 0 && (
                <a target="_blank" href={call.recording}>
                  Recording Link
                </a>
              )}
              <div className="buttonBox">
                <button
                  type="button"
                  className="redButton"
                  onClick={closeContextual}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      ));
    }
  };
  return (
    <div className="callBox">
      {callPopups(callData)}
      {weekGetsPrivateCalls(data.recordId) && (
        <button
          type="button"
          className="greenButton"
          onClick={() => openNewCallPopup(data.recordId)}
        >
          New
        </button>
      )}
      {contextual === `newCallForWeek${data.recordId}` && (
        <div className="callPopup" ref={setContextualRef}>
          <h4>
            {
              getStudentFromMembershipId(
                getMembershipFromWeekId(data.recordId).recordId,
              ).fullName
            }{' '}
            {
              getCourseFromMembershipId(
                getMembershipFromWeekId(data.recordId).recordId,
              ).name
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
      )}
    </div>
  );
}
