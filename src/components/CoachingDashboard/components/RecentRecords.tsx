import type {
  Assignment,
  GroupSession,
  PrivateCall,
} from 'src/types/CoachingTypes';
import AssignmentRecordRow from './AssignmentRecordRow';
import GroupCallRecordRow from './GroupCallRecordRow';

import PrivateCallRecordRow from './PrivateCallRecordRow';

interface RecentRecordsObject {
  assignments: Assignment[];
  privateCalls: PrivateCall[];
  groupSessions: GroupSession[];
}

export default function RecentRecords({
  recentRecords,
}: {
  recentRecords: RecentRecordsObject | undefined;
}) {
  if (
    !recentRecords ||
    !recentRecords.assignments ||
    recentRecords.assignments.length === 0
  )
    return null;

  const { assignments, privateCalls, groupSessions } = recentRecords;
  return (
    <div>
      <h3>Recent Records</h3>
      <h4>Assignments</h4>
      <ul>
        {assignments &&
          assignments.length > 0 &&
          assignments.map((assignment) => (
            <AssignmentRecordRow
              key={assignment.recordId}
              assignment={assignment}
            />
          ))}
      </ul>
      <h4>Private Calls</h4>
      <ul>
        {privateCalls &&
          privateCalls.length > 0 &&
          privateCalls.map((privateCall) => (
            <PrivateCallRecordRow
              key={privateCall.recordId}
              privateCall={privateCall}
            />
          ))}
      </ul>
      <h4>Group Sessions</h4>
      <ul>
        {groupSessions &&
          groupSessions.length > 0 &&
          groupSessions.map((groupSession) => (
            <GroupCallRecordRow
              key={groupSession.recordId}
              groupCall={groupSession}
            />
          ))}
      </ul>
    </div>
  );
}
