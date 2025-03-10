import React from 'react';
import { toISODate } from 'src/functions/dateUtils';
import { useCourseList } from 'src/hooks/CoachingData/queries';
import { useStudentMemberships } from 'src/hooks/CoachingData/queries/useStudentDeepDive';

interface StudentMembershipsProps {
  studentId: string;
  selectedMembershipId: number | null;
  onMembershipSelect: (membershipId: number | null) => void;
}

const StudentMemberships: React.FC<StudentMembershipsProps> = ({
  studentId,
  selectedMembershipId,
  onMembershipSelect,
}) => {
  const { courseListQuery } = useCourseList();
  const studentMembershipsQuery = useStudentMemberships(studentId);

  // Enable the query when we have a studentId
  React.useEffect(() => {
    if (studentId) {
      studentMembershipsQuery.refetch();
    }
  }, [studentId, studentMembershipsQuery]);

  if (!studentMembershipsQuery.isSuccess || !courseListQuery.isSuccess) {
    return <div>Loading memberships...</div>;
  }

  const getCourseName = (courseId: number) => {
    const course = courseListQuery.data?.find((c) => c.recordId === courseId);
    return course?.name || 'Unknown Course';
  };

  return (
    <div className="student-memberships">
      <h3>Memberships</h3>
      {studentMembershipsQuery.data?.length === 0 ? (
        <p>No memberships found</p>
      ) : (
        <div className="memberships-list">
          {studentMembershipsQuery.data?.map((membership) => (
            <div key={membership.recordId} className="membership-card">
              <div className="membership-header">
                <h4>{getCourseName(membership.relatedCourse)}</h4>
                <div className="membership-status">
                  {membership.active && !membership.onHold && (
                    <span className="status active">Active</span>
                  )}
                  {membership.onHold && (
                    <span className="status on-hold">On Hold</span>
                  )}
                  {!membership.active && !membership.onHold && (
                    <span className="status inactive">Inactive</span>
                  )}
                </div>
              </div>
              <div className="membership-details">
                <div className="detail-row">
                  <span className="label">Start Date:</span>
                  <span className="value">
                    {toISODate(new Date(membership.startDate))}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">End Date:</span>
                  <span className="value">
                    {toISODate(new Date(membership.endDate))}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Recorded Week:</span>
                  <span className="value">
                    {membership.lastRecordedWeekStarts
                      ? toISODate(new Date(membership.lastRecordedWeekStarts))
                      : 'No recorded weeks'}
                  </span>
                </div>
                <div className="detail-row">
                  <button
                    className="view-weeks-button"
                    type="button"
                    onClick={() =>
                      onMembershipSelect(
                        selectedMembershipId === membership.recordId
                          ? null
                          : membership.recordId,
                      )
                    }
                  >
                    {selectedMembershipId === membership.recordId
                      ? 'Hide Weeks'
                      : 'View Weeks'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMemberships;
