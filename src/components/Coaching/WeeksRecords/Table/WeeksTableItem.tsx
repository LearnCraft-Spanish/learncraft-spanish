import type { Week } from 'src/types/CoachingTypes';
import checkmark from 'src/assets/icons/checkmark_green.svg';

import useCoaching from 'src/hooks/CoachingData/useCoaching';

import AssignmentsCell from './AssignmentsCell';
import GroupSessionsCell from './GroupSessions/GroupSessionsCell';
import PrivateCallsCell from './PrivateCallsCell';
import StudentCell from './StudentCell';

export default function WeeksTableItem({ week }: { week: Week }) {
  const {
    getAssignmentsFromWeekRecordId,
    getGroupSessionsFromWeekRecordId,
    getPrivateCallsFromWeekRecordId,
    getStudentFromMembershipId,
  } = useCoaching();

  return (
    <tr>
      <td>
        <StudentCell
          week={week}
          student={getStudentFromMembershipId(week.relatedMembership)}
        />
      </td>
      <td>{week.weekStarts.toString()}</td>
      <td>
        <AssignmentsCell
          week={week}
          assignments={getAssignmentsFromWeekRecordId(week.recordId)}
        />
      </td>
      <td>
        {week.numberOfGroupCalls > 0 && (
          <GroupSessionsCell
            week={week}
            groupSessions={getGroupSessionsFromWeekRecordId(week.recordId)}
          />
        )}
      </td>
      <td>
        {week.membershipCourseWeeklyPrivateCalls > 0 && (
          <PrivateCallsCell
            week={week}
            calls={getPrivateCallsFromWeekRecordId(week.recordId)}
          />
        )}
      </td>
      <td>{week.notes}</td>
      <td>{week.currentLessonName}</td>
      <td>
        {week.holdWeek && (
          <img className="checkmark" src={checkmark} alt="Checkmark" />
        )}
      </td>
      <td>
        {week.recordsComplete && (
          <img className="checkmark" src={checkmark} alt="Checkmark" />
        )}
      </td>
    </tr>
  );
}
