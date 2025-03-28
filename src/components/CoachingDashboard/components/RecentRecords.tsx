import type {
  Assignment,
  GroupSession,
  PrivateCall,
} from 'src/types/CoachingTypes';

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
  console.log(recentRecords);

  const { assignments, privateCalls, groupSessions } = recentRecords;
  return (
    <div>
      <h3>Recent Records</h3>
      <h4>Assignments</h4>
      <ul>
        {assignments.map((assignment) => (
          <li key={assignment.recordId}>{assignment.assignmentType}</li>
        ))}
      </ul>
      <h4>Private Calls</h4>
      <ul>
        {privateCalls.map((privateCall) => (
          <li key={privateCall.recordId}>{privateCall.callType}</li>
        ))}
      </ul>
      <h4>Group Sessions</h4>
      <ul>
        {groupSessions.map((groupSession) => (
          <li key={groupSession.recordId}>{groupSession.sessionType}</li>
        ))}
      </ul>
    </div>
  );
}
