import React, { useState } from 'react';
import { useCourseList } from 'src/hooks/CoachingData/queries';
import { useStudentMemberships } from 'src/hooks/CoachingData/queries/useStudentDeepDive';
import MembershipWeeks from './MembershipWeeks';

interface StudentMembershipsProps {
  studentId: string;
}

const StudentMemberships: React.FC<StudentMembershipsProps> = ({
  studentId,
}) => {
  const { courseListQuery } = useCourseList();
  const studentMembershipsQuery = useStudentMemberships(studentId);
  const [selectedMembershipId, setSelectedMembershipId] = useState<
    number | null
  >(null);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                    {formatDate(membership.startDate.toString())}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">End Date:</span>
                  <span className="value">
                    {formatDate(membership.endDate.toString())}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Last Recorded Week:</span>
                  <span className="value">
                    {membership.lastRecordedWeekStarts
                      ? formatDate(membership.lastRecordedWeekStarts.toString())
                      : 'No recorded weeks'}
                  </span>
                </div>
                <div className="detail-row">
                  <button
                    className="view-weeks-button"
                    type="button"
                    onClick={() =>
                      setSelectedMembershipId(
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
              {selectedMembershipId === membership.recordId && (
                <MembershipWeeks membershipId={membership.recordId} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentMemberships;
