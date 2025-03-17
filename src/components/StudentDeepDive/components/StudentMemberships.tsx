import React from 'react';
import downArrow from 'src/assets/icons/down-arrow.svg';
import { InlineLoading } from 'src/components/Loading';
import { toISODate } from 'src/functions/dateUtils';
import { useCourseList } from 'src/hooks/CoachingData/queries';
import { useStudentMemberships } from 'src/hooks/CoachingData/queries/useStudentDeepDive';
import MembershipWeeks from './MembershipWeeks';
interface StudentMembershipsProps {
  studentId: number;
  selectedMembershipId: number | undefined;
  onMembershipSelect: (membershipId: number | undefined) => void;
}

export default function StudentMemberships({
  studentId,
  selectedMembershipId,
  onMembershipSelect,
}: StudentMembershipsProps) {
  const { courseListQuery } = useCourseList();
  const studentMembershipsQuery = useStudentMemberships(studentId);

  // Sort memberships only if we have data
  const sortedMemberships = React.useMemo(() => {
    if (!studentMembershipsQuery.isSuccess) return [];
    return studentMembershipsQuery.data.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA; // Sort in descending order (newest first)
    });
  }, [studentMembershipsQuery.isSuccess, studentMembershipsQuery.data]);

  const getCourseName = (courseId: number) => {
    const course = courseListQuery.data?.find((c) => c.recordId === courseId);
    return course?.name || 'Unknown Course';
  };

  return (
    <div className="student-memberships">
      <h3>Memberships</h3>
      {(!studentMembershipsQuery.isSuccess || !courseListQuery.isSuccess) && (
        <InlineLoading />
      )}
      {studentMembershipsQuery.isSuccess && courseListQuery.isSuccess && (
        <>
          {sortedMemberships.length === 0 ? (
            <p>No memberships found</p>
          ) : (
            <div className="memberships-list">
              {sortedMemberships.map((membership) => (
                <React.Fragment key={membership.recordId}>
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
                    {/* Data to display:
              - start date
              - end date
              - last recorded lesson?
              - active
              - on hold
              */}
                    <div className="membership-details">
                      <div className="detail-row">
                        <button
                          className={
                            selectedMembershipId === membership.recordId
                              ? 'view-weeks-button active'
                              : 'view-weeks-button'
                          }
                          type="button"
                          onClick={() =>
                            onMembershipSelect(
                              selectedMembershipId === membership.recordId
                                ? undefined
                                : membership.recordId,
                            )
                          }
                        >
                          <img
                            src={downArrow}
                            alt="down-arrow"
                            className={
                              selectedMembershipId === membership.recordId
                                ? 'down-arrow active'
                                : 'down-arrow'
                            }
                          />
                          {selectedMembershipId === membership.recordId
                            ? 'Hide Weeks'
                            : 'View Weeks'}
                        </button>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Start Date:</span>
                        <span className="detail-value">
                          {toISODate(new Date(membership.startDate))}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">End Date:</span>
                        <span className="detail-value">
                          {membership.endDate &&
                            toISODate(new Date(membership.endDate))}
                        </span>
                      </div>
                      {/* <div className="detail-row">
                  <span className="detail-label">Last Recorded Lesson:</span>
                  <span className="detail-value">
                    {membership.lastRecordedLesson
                      ? toISODate(new Date(membership.lastRecordedLesson))
                      : 'No recorded lessons'}
                  </span>
                </div> */}
                    </div>
                    {selectedMembershipId === membership.recordId && (
                      <div className="membership-weeks">
                        <MembershipWeeks membershipId={membership.recordId} />
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
