import type { Week } from '../../../../types/CoachingTypes';
import GroupSessionsCell from './GroupSessionsCell';
import useCoaching from '../../../../hooks/useCoaching';
import { useContextualMenu } from '../../../../hooks/useContextualMenu';
import AssignmentsCell from './AssignmentsCell';
import PrivateCallsCell from './PrivateCallsCell';
import StudentCell from './StudentCell';
import ViewWeekRecord from '../ViewWeekRecord';
import checkmark from '../../../../assets/icons/checkmark_green.svg';

interface NewTableProps {
  weeks: Week[] | undefined;
}
export default function WeeksTable({ weeks }: NewTableProps) {
  const { contextual } = useContextualMenu();
  const { getAssignmentsFromWeekRecordId, getPrivateCallsFromWeekRecordId } =
    useCoaching();

  return (
    weeks && (
      <table>
        <thead>
          <tr>
            <th>Student</th>
            {/* <th>Level</th> */}
            {/* <th>Primary Coach</th> */}
            <th>Week Starts</th>
            <th>Assignments</th>
            <th>Group Calls</th>
            {/* <th>Group Call Comments</th> */}
            <th>Private Calls</th>
            <th>Notes</th>
            <th>Current Lesson </th>
            <th>Hold Week</th>
            <th>Records Complete?</th>
            <th>Membership - Student - Call Credits Remaining</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.recordId}>
              <td>
                <StudentCell week={week} />
              </td>
              {/* <td>{week.level}</td> */}
              {/* <td>
                {week.primaryCoach.name
                  ? week.primaryCoach.name
                  : 'No Primary Coach Found'}
              </td> */}
              <td>{week.weekStarts.toString()}</td>
              <td>
                {week.assignmentRatings.length > 0 &&
                  getAssignmentsFromWeekRecordId(week.recordId)?.map(
                    (assignment) => (
                      // <p>{assignment.rating}</p>
                      <AssignmentsCell
                        assignment={assignment}
                        key={`assignment${assignment.recordId}`}
                      />
                    ),
                  )}
              </td>
              <td>
                {week.numberOfGroupCalls > 0 && (
                  <GroupSessionsCell week={week} />
                )}
              </td>
              {/* <td>{week.groupCallComments}</td> */}
              <td>
                {week.privateCallsCompleted > 0 && (
                  // getPrivateCallsFromWeekRecordId(week.recordId)?.map(
                  <PrivateCallsCell week={week} />
                )}
              </td>
              <td>{week.notes}</td>
              <td>{week.currentLessonName}</td>
              <td>{week.holdWeek}</td>
              <td>
                {week.recordsComplete && (
                  <img className="checkmark" src={checkmark} alt="Checkmark" />
                )}
              </td>
              <td>{week.membershipStudentCallCreditsRemaining}</td>
              {/* {contextual === `week${week.recordId}` && (
                  <ViewWeekRecord week={week} />
                )} */}
            </tr>
          ))}
        </tbody>
      </table>
    )
  );
}
