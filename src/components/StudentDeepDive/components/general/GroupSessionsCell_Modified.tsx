import type { GroupSessionWithAttendees } from 'src/types/CoachingTypes';
import {
  DateInput,
  Dropdown,
  LinkInput,
  TextAreaInput,
} from 'src/components/Coaching/general/';

import ContextualControls from 'src/components/ContextualControls';

import { useContextualMenu } from 'src/hooks/useContextualMenu';

// const sessionTypeOptions = [
//   '1MC',
//   '2MC',
//   'Modules 1 & 2',
//   'Level 1',
//   'Level 2',
//   'Level 3',
//   'Level 4',
//   'Level 5',
//   'Level 6',
//   'Module 3',
//   'Module 4',
//   'LCS Cohort',
//   'Advanced',
//   'Conversation',
// ];

function GroupSessionCell({
  groupSession,
}: {
  groupSession: GroupSessionWithAttendees;
}) {
  const { contextual, openContextual } = useContextualMenu();
  return (
    <div className="cellWithContextual">
      <button
        type="button"
        onClick={() => openContextual(`groupSession${groupSession.recordId}`)}
      >
        {groupSession.sessionType}
      </button>

      {contextual === `groupSession${groupSession.recordId}` && (
        <GroupSessionView groupSession={groupSession} />
      )}
    </div>
  );
}

export function GroupSessionView({
  groupSession,
}: {
  groupSession: GroupSessionWithAttendees;
}) {
  const { setContextualRef } = useContextualMenu();

  return (
    <div className="contextualWrapper">
      <div className="contextual" ref={setContextualRef}>
        <ContextualControls />

        <h3>{`Session: ${groupSession.sessionType} on ${groupSession.date}`}</h3>
        <div>
          {/* <CoachDropdown
            coachEmail={groupSession.coach.email}
            onChange={() => {}}
            editMode={false}
          /> */}
          <div className="lineWrapper">
            <h4 className="label">Coach</h4>
            <p className="content">{groupSession.coach.name}</p>
          </div>
          <DateInput
            value={
              typeof groupSession.date === 'string'
                ? groupSession.date
                : groupSession.date.toISOString()
            }
            onChange={() => {}}
          />
          <Dropdown
            label="Session Type"
            value={groupSession.sessionType}
            onChange={() => {}}
            options={[]}
            editMode={false}
          />
        </div>
        <Dropdown
          value={groupSession.topic}
          onChange={() => {}}
          editMode={false}
          label="Topic"
          options={[]}
        />
        <TextAreaInput
          label="Comments"
          value={groupSession.comments}
          onChange={() => {}}
          editMode={false}
        />
        <LinkInput
          label="Call Document"
          value={groupSession.callDocument}
          onChange={() => {}}
          editMode={false}
        />
        <LinkInput
          label="Zoom Link"
          value={groupSession.zoomLink}
          onChange={() => {}}
          editMode={false}
        />

        <div className="lineWrapper">
          <label className="label">Attendees:</label>
          <div className="content">
            {groupSession.attendees &&
              groupSession.attendees.map((attendee) => (
                // if attendee is to be removed, don't display it
                <div key={attendee.student} className="attendee-wrapper">
                  <p> {attendee.weekStudent}</p>
                </div>
              ))}
          </div>
        </div>

        {/* userDataQuery.data?.roles.adminRole === 'admin' && (
            <DeleteRecord deleteFunction={deleteRecordFunction} />
          )} */}
      </div>
    </div>
  );
}

export default function GroupSessionsCell({
  groupSessions,
}: {
  groupSessions: GroupSessionWithAttendees[];
}) {
  return (
    <>
      {groupSessions?.map((groupSession) => (
        <GroupSessionCell
          groupSession={groupSession}
          key={groupSession.recordId}
        />
      ))}
    </>
  );
}
