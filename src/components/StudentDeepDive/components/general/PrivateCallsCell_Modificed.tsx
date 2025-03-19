import type { PrivateCall } from 'src/types/CoachingTypes';
import React from 'react';
import {
  Dropdown,
  LinkInput,
  TextAreaInput,
} from 'src/components/Coaching/general';
import ContextualControls from 'src/components/ContextualControls';
import { useContextualMenu } from 'src/hooks/useContextualMenu';

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
  studentName,
}: {
  call: PrivateCall;
  studentName: string;
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
        <PrivateCallView call={call} studentName={studentName} />
      )}
    </div>
  );
}

function PrivateCallView({
  call,
  studentName,
}: {
  call: PrivateCall;
  studentName: string;
}) {
  const { setContextualRef } = useContextualMenu();

  return (
    <div className="contextualWrapper">
      <div className="contextual" ref={setContextualRef}>
        <ContextualControls />

        <h4>
          {/* {
              getStudentFromMembershipId(
                getMembershipFromWeekRecordId(call.relatedWeek)?.recordId,
              )?.fullName
            }{' '} */}
          {studentName} on{' '}
          {typeof call.date === 'string' ? call.date : call.date.toString()}
        </h4>

        <div className="lineWrapper">
          <p className="label">Student: </p>
          {/* <p>
              {
                getStudentFromMembershipId(
                  getMembershipFromWeekRecordId(call.relatedWeek)?.recordId,
                )?.fullName
              }
            </p> */}
          {studentName}
        </div>

        <div className="lineWrapper">
          <h4 className="label">Caller</h4>
          <p className="content">{call.caller.name}</p>
        </div>

        {/* <CoachDropdown
          label="Caller"
          coachEmail={call.caller}
          onChange={() => {}}
          editMode={false}
        /> */}

        {/* {editMode && <DateInput value={date} onChange={setDate} />} */}

        <Dropdown
          label="Rating"
          value={call.rating}
          onChange={() => {}}
          options={ratingOptions}
          editMode={false}
        />

        <TextAreaInput
          label="Notes"
          value={call.notes}
          onChange={() => {}}
          editMode={false}
        />

        <TextAreaInput
          label="Difficulties"
          value={call.areasOfDifficulty}
          onChange={() => {}}
          editMode={false}
        />

        <LinkInput
          label="Recording Link"
          value={call.recording}
          onChange={() => {}}
          editMode={false}
        />

        <Dropdown
          label="Call Type"
          value={call.callType}
          onChange={() => {}}
          options={callTypeOptions}
          editMode={false}
        />

        {/* {editMode && userDataQuery.data?.roles.adminRole === 'admin' && (
          <DeleteRecord deleteFunction={deleteRecordFunction} />
        )} */}
      </div>
    </div>
  );
}

export default function PrivateCallsCell({
  calls,
  studentName,
}: {
  calls: PrivateCall[] | null;
  studentName: string;
}) {
  return (
    <div className="callBox">
      {/* Existing Calls */}
      {calls &&
        calls.map((call) => (
          <PrivateCallInstance
            key={call.recordId}
            call={call}
            studentName={studentName}
          />
        ))}
    </div>
  );
}
