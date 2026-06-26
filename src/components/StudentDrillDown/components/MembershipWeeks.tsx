import { InlineLoading } from '@interface/components/Loading';
import React, { useMemo } from 'react';
import { useMembershipWeeksQuery } from 'src/hexagon/application/queries/WeekQueries/useMembershipWeeksQuery';
import { toISODate } from 'src/hexagon/domain/functions/dateUtils';
import AssignmentsCell from './general/AssignmentsCell_Modificed';
import GroupSessionsCell from './general/GroupSessionsCell_Modified';
import PrivateCallsCell from './general/PrivateCallsCell_Modificed';
import '../StudentDrillDown.scss';

interface MembershipWeeksProps {
  membershipId: number;
  studentName: string;
}

export default function MembershipWeeks({
  membershipId,
  studentName,
}: MembershipWeeksProps) {
  const { membershipWeeksQuery } = useMembershipWeeksQuery(membershipId);

  const isLoading = membershipWeeksQuery.isLoading;

  const sortedWeeks = useMemo(() => {
    if (!membershipWeeksQuery.data) return [];
    return membershipWeeksQuery.data.slice().sort((a, b) => {
      const dateA = new Date(a.weekStarts?.toString() ?? '');
      const dateB = new Date(b.weekStarts?.toString() ?? '');
      return dateB.getTime() - dateA.getTime();
    });
  }, [membershipWeeksQuery.data]);

  return (
    <div className="membership-weeks">
      {isLoading ? (
        <InlineLoading message="Loading weeks..." />
      ) : sortedWeeks.length === 0 ? (
        <p>No weeks recorded</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Current Lesson</th>
              <th>Notes</th>
              <th>Private Calls</th>
              <th>Group Calls</th>
              <th>Assignments</th>
            </tr>
          </thead>
          <tbody className="weeks-list">
            {sortedWeeks.map((week) => (
              <tr key={week.weekId}>
                <td>
                  <h4>Week {week.weekNumber}</h4>
                  <span>
                    {week.weekStarts
                      ? toISODate(new Date(week.weekStarts.toString()))
                      : ''}
                  </span>
                </td>
                <td>{week.lesson?.lessonName}</td>
                <td>{week.notes}</td>
                <td>
                  {week.privateCalls.length > 0 && (
                    <PrivateCallsCell
                      calls={week.privateCalls}
                      studentName={studentName}
                    />
                  )}
                </td>
                <td>
                  {week.groupCalls.length > 0 && (
                    <GroupSessionsCell groupSessions={week.groupCalls} />
                  )}
                </td>
                <td>
                  {week.assignments.length > 0 && (
                    <AssignmentsCell assignments={week.assignments} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
