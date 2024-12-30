import type { Week } from './CoachingTypes';
import NewGroupSessionsCell from './NewGroupSessionCell';
import useCoaching from '../../hooks/useCoaching';
import { useEffect } from 'react';

interface NewTableProps {
  weeks: Week[] | undefined;
}
export default function NewTable({ weeks }: NewTableProps) {
  return (
    weeks && (
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Level</th>
            <th>Primary Coach</th>
            <th>Week Starts</th>
            <th>Assignment Ratings</th>
            <th>Number of Group Calls</th>
            <th>Group Call Comments</th>
            <th>Current Lesson Name </th>
            <th>Notes</th>
            <th>Hold Week</th>
            <th>Records Complete?</th>
            <th>Membership - Student - Call Credits Remaining</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week.recordId}>
              <td>{week.student}</td>
              <td>{week.level}</td>
              <td>
                {week.primaryCoach.name
                  ? week.primaryCoach.name
                  : 'No Primary Coach Found'}
              </td>
              <td>{week.weekStarts.toString()}</td>
              <td>{week.assignmentRatings}</td>
              <td>
                {week.numberOfGroupCalls > 0 ? (
                  <NewGroupSessionsCell week={week} />
                ) : (
                  'No Group Calls'
                )}
              </td>
              <td>{week.groupCallComments}</td>
              <td>{week.currentLessonName}</td>
              <td>{week.notes}</td>
              <td>{week.holdWeek}</td>
              <td>{week.recordsComplete}</td>
              <td>{week.membershipStudentCallCreditsRemaining}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  );
}
