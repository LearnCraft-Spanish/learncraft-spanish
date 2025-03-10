import React from 'react';
import { toISODate } from 'src/functions/dateUtils';
import { useMembershipWeeks } from 'src/hooks/CoachingData/queries/useStudentDeepDive';

interface MembershipWeeksProps {
  membershipId: number;
}

const MembershipWeeks: React.FC<MembershipWeeksProps> = ({ membershipId }) => {
  const weeksQuery = useMembershipWeeks(membershipId);

  React.useEffect(() => {
    if (membershipId) {
      weeksQuery.refetch();
    }
  }, [membershipId, weeksQuery]);

  if (!weeksQuery.isSuccess) {
    return <div>Loading weeks...</div>;
  }

  const sortedWeeks = weeksQuery.data?.sort((a, b) => {
    const dateA = new Date(a.weekStarts.toString());
    const dateB = new Date(b.weekStarts.toString());
    return dateB.getTime() - dateA.getTime(); // Sort in descending order (newest first)
  });

  return (
    <div className="membership-weeks">
      <h3>Weeks</h3>
      {sortedWeeks.length === 0 ? (
        <p>No weeks recorded</p>
      ) : (
        <div className="weeks-list">
          {sortedWeeks.map((week) => (
            <div key={week.recordId} className="week-card">
              <div className="week-header">
                <h4>Week {week.week}</h4>
                <span className="week-date">
                  {toISODate(new Date(week.weekStarts))}
                </span>
              </div>
              <div className="week-stats">
                <div className="stat-row">
                  <span className="stat-label">Group Calls:</span>
                  <span className="stat-value">{week.numberOfGroupCalls}</span>
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
                    {week.assignmentRatings.length}
                  </span>
                </div>
              </div>
              {week.notes && (
                <div className="week-notes">
                  <span className="notes-label">Notes:</span>
                  <p className="notes-content">{week.notes}</p>
                </div>
              )}
              {week.assignmentRatings.length > 0 && (
                <div className="week-assignments">
                  <span className="assignments-label">Assignments:</span>
                  <ul className="assignments-list">
                    {week.assignmentRatings.map(
                      (rating: string, index: number) => (
                        <li
                          key={`${index}-${rating}`}
                          className="assignment-item"
                        >
                          {rating}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembershipWeeks;
