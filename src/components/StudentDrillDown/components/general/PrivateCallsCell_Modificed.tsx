import type { FurnishedWeek } from '@learncraft-spanish/shared';
import { Dropdown } from '@interface/components/FormComponents';
import React from 'react';
import { LinkInput, TextAreaInput } from 'src/components/FormComponents';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import '../../../Coaching/coaching.scss';

type PrivateCallItem = FurnishedWeek['privateCalls'][number];

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
const callTypeOptions = [
  'Monthly Call',
  'Strategy Call',
  'Uses Credit (Bundle)',
];

function PrivateCallInstance({
  call,
  studentName,
}: {
  call: PrivateCallItem;
  studentName: string;
}) {
  const { openContextual, contextual } = useContextualMenu();

  return (
    <div className="cellWithContextual" key={call.callId}>
      <button
        type="button"
        onClick={() => openContextual(`call${call.callId}`)}
      >
        {call.callRating.rating}
      </button>
      {contextual === `call${call.callId}` && (
        <PrivateCallView call={call} studentName={studentName} />
      )}
    </div>
  );
}

function PrivateCallView({
  call,
  studentName,
}: {
  call: PrivateCallItem;
  studentName: string;
}) {
  return (
    <ContextualView>
      <h4>
        {studentName} on{' '}
        {typeof call.callDate === 'string'
          ? call.callDate
          : call.callDate.toString()}
      </h4>

      <div className="lineWrapper">
        <p className="label">Student: </p>
        {studentName}
      </div>

      <div className="lineWrapper">
        <h4 className="label">Caller</h4>
        <p className="content">{call.caller.fullName}</p>
      </div>

      <Dropdown
        label="Rating"
        value={call.callRating.rating}
        onChange={() => {}}
        options={ratingOptions}
        editMode={false}
      />

      <TextAreaInput
        label="Notes"
        value={call.notes ?? ''}
        onChange={() => {}}
        editMode={false}
      />

      <TextAreaInput
        label="Difficulties"
        value={call.areasOfDifficulty ?? ''}
        onChange={() => {}}
        editMode={false}
      />

      <LinkInput
        label="Recording Link"
        value={call.recording ?? ''}
        onChange={() => {}}
        editMode={false}
      />

      <Dropdown
        label="Call Type"
        value={call.callType.callType}
        onChange={() => {}}
        options={callTypeOptions}
        editMode={false}
      />
    </ContextualView>
  );
}

export default function PrivateCallsCell({
  calls,
  studentName,
}: {
  calls: PrivateCallItem[] | null;
  studentName: string;
}) {
  return (
    <div className="callBox">
      {calls &&
        calls.map((call) => (
          <PrivateCallInstance
            key={call.callId}
            call={call}
            studentName={studentName}
          />
        ))}
    </div>
  );
}
