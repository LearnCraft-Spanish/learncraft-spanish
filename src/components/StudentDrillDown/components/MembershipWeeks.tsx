import { InlineLoading } from '@interface/components/Loading';
import React, { useMemo } from 'react';
import { toISODate } from 'src/hexagon/domain/functions/dateUtils';

import { useMembershipWeeks } from 'src/hooks/CoachingData/queries/StudentDrillDown';
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
  const weeksQuery = useMembershipWeeks(membershipId);

  const isLoading = weeksQuery.isLoading;

  // const sortedWeeks = useMemo(() => {
  //   if (!weeksQuery.data) return [];
  //   return weeksQuery.data.sort((a, b) => {
  //     const dateA = new Date(a.weekStarts.toString());
  //     const dateB = new Date(b.weekStarts.toString());
  //     return dateB.getTime() - dateA.getTime(); // Sort in descending order (newest first)
  //   });
  // }, [weeksQuery.data]);
  // if (!weeksQuery.isSuccess) {
  //   return <div>Loading weeks...</div>;
  // }
  const sortedWeeks = useMemo(() => {
    if (!weeksQuery.data) return [];
    return weeksQuery.data.sort((a, b) => {
      const dateA = new Date(a.weekStarts.toString());
      const dateB = new Date(b.weekStarts.toString());
      return dateB.getTime() - dateA.getTime(); // Sort in descending order (newest first)
    });
  }, [weeksQuery.data]);
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
              <tr key={week.recordId}>
                <td>
                  <h4>Week {week.week}</h4>
                  <span>{toISODate(new Date(week.weekStarts))}</span>
                </td>
                <td>{week.currentLessonName}</td>
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
                  {week.groupSessions.length > 0 && (
                    <GroupSessionsCell groupSessions={week.groupSessions} />
                  )}
                </td>
                <td>
                  {week.assignments.length > 0 && (
                    <AssignmentsCell assignments={week.assignments} />
                  )}
                </td>
              </tr>
            ))}

            {/* <h3>Weeks</h3>
          <div className="weeks-list">
            {sortedWeeks.map((week) => (
              <div key={week.recordId} className="week-card">
                <div className="week-header">
                  <h4>
                    Week {week.week} - {toISODate(new Date(week.weekStarts))}
                  </h4>
                </div>
                <div className="week-stats">
                  <div className="stat-row">
                    <span className="stat-label">Group Calls:</span>
                    <span className="stat-value">
                      {week.numberOfGroupCalls}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Private Calls:</span>
                    <span className="stat-value">
                      {week.privateCallsCompleted}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Assignments:</span>
                    <span className="stat-value">
                      {week.assignments.length}
                    </span>
                  </div>
                </div>
                {week.notes && (
                  <div className="week-notes">
                    <span className="notes-label">Notes:</span>
                    <p className="notes-content">{week.notes}</p>
                  </div>
                )}
                {week.assignments.length > 0 && (
                  <div className="week-assignments">
                    <span className="assignments-label">Assignments:</span>
                    <ul className="assignments-list">
                      {week.assignments.map((assignment) => (
                        <li
                          key={assignment.recordId}
                          className="assignment-item"
                        >
                          {assignment.assignmentType}:{assignment.rating}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {week.privateCalls.length > 0 && (
                  <div className="week-private-calls">
                    <span className="private-calls-label">Private Calls:</span>
                    <ul className="private-calls-list">
                      {week.privateCalls.map((call) => (
                        <li key={call.recordId} className="private-call-item">
                          Rating: {call.rating}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {week.groupSessions.length > 0 && (
                  <div className="week-group-sessions">
                    <span className="group-sessions-label">
                      Group Sessions:
                    </span>
                    <ul className="group-sessions-list">
                      {week.groupSessions.map((session) => (
                        <li
                          key={session.recordId}
                          className="group-session-item"
                        >
                          {session.sessionType} - Coach: {session.coach.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </> */}
          </tbody>
        </table>
      )}
    </div>
  );
}
