import type { BaseGroupSession } from '@learncraft-spanish/shared';
import { Dropdown } from '@interface/components/FormComponents';
import {
  DateInput,
  LinkInput,
  TextAreaInput,
} from 'src/components/FormComponents';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';

import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import '../../../Coaching/coaching.scss';

function GroupSessionCell({
  groupSession,
}: {
  groupSession: BaseGroupSession;
}) {
  const { contextual, openContextual } = useContextualMenu();
  return (
    <div className="cellWithContextual">
      <button
        type="button"
        onClick={() =>
          openContextual(`groupSession${groupSession.groupSessionId}`)
        }
      >
        {groupSession.groupSessionType?.groupSessionType}
      </button>

      {contextual === `groupSession${groupSession.groupSessionId}` && (
        <GroupSessionView groupSession={groupSession} />
      )}
    </div>
  );
}

export function GroupSessionView({
  groupSession,
}: {
  groupSession: BaseGroupSession;
}) {
  return (
    <ContextualView>
      <h3>{`Session: ${groupSession.groupSessionType?.groupSessionType} on ${groupSession.callDate}`}</h3>
      <div>
        <div className="lineWrapper">
          <h4 className="label">Coach</h4>
          <p className="content">{groupSession.coach.fullName}</p>
        </div>
        <DateInput
          value={
            typeof groupSession.callDate === 'string'
              ? groupSession.callDate
              : groupSession.callDate.toISOString()
          }
          onChange={() => {}}
        />
        <Dropdown
          label="Session Type"
          value={groupSession.groupSessionType?.groupSessionType}
          onChange={() => {}}
          options={[]}
          editMode={false}
        />
      </div>
      <Dropdown
        value={groupSession.groupSessionTopic?.groupSessionTopic}
        onChange={() => {}}
        editMode={false}
        label="Topic"
        options={[]}
      />
      <TextAreaInput
        label="Comments"
        value={groupSession.comments ?? ''}
        onChange={() => {}}
        editMode={false}
      />
      <LinkInput
        label="Call Document"
        value={groupSession.callDocument ?? ''}
        onChange={() => {}}
        editMode={false}
      />
      <LinkInput
        label="Zoom Link"
        value={groupSession.zoomLink ?? ''}
        onChange={() => {}}
        editMode={false}
      />

      <div className="lineWrapper">
        <label className="label">Attendees:</label>
        <div className="content">
          {groupSession.attendees &&
            groupSession.attendees.map((attendee) => (
              <div key={attendee.groupAttendeeId} className="attendee-wrapper">
                <p>{String(attendee.weekId)}</p>
              </div>
            ))}
        </div>
      </div>
    </ContextualView>
  );
}

export default function GroupSessionsCell({
  groupSessions,
}: {
  groupSessions: BaseGroupSession[];
}) {
  return (
    <>
      {groupSessions?.map((groupSession) => (
        <GroupSessionCell
          groupSession={groupSession}
          key={groupSession.groupSessionId}
        />
      ))}
    </>
  );
}
