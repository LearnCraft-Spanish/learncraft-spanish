import type { Membership } from 'src/types/CoachingTypes';
import React, { useMemo, useState } from 'react';
import downArrow from 'src/assets/icons/down-arrow.svg';
import pencilIcon from 'src/assets/icons/pencil.svg';
import ContextualControls from 'src/components/ContextualControls';
import {
  Checkbox,
  DateInput,
  FormControls,
  TextInput,
} from 'src/components/FormComponents';
import { InlineLoading } from 'src/components/Loading';
import { toISODate } from 'src/functions/dateUtils';
import { useCoachList, useCourseList } from 'src/hooks/CoachingData/queries';
import {
  useAllStudents,
  useStudentMemberships,
} from 'src/hooks/CoachingData/queries/StudentDrillDown';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useUserData } from 'src/hooks/UserData/useUserData';
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
  const { allStudentsQuery } = useAllStudents();
  const { studentMembershipsQuery } = useStudentMemberships(studentId);
  const { contextual, openContextual } = useContextualMenu();
  // Sort memberships only if we have data
  const sortedMemberships = React.useMemo(() => {
    if (!studentMembershipsQuery.isSuccess) return [];
    return studentMembershipsQuery.data.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA; // Sort in descending order (newest first)
    });
  }, [studentMembershipsQuery.isSuccess, studentMembershipsQuery.data]);

  const student = useMemo(() => {
    const student = allStudentsQuery.data?.find(
      (s) => s.recordId === studentId,
    );
    return student ? student.fullName : '';
  }, [allStudentsQuery.data, studentId]);

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
                      <img
                        src={pencilIcon}
                        alt="pencil"
                        className="editIcon"
                        onClick={() =>
                          openContextual(
                            `edit-membership-${membership.recordId}`,
                          )
                        }
                      />
                      <h4>{getCourseName(membership.relatedCourse)}</h4>
                      <div className="membership-status">
                        {membership.active && !membership.onHold && (
                          <span className="status active">Active</span>
                        )}
                        {!membership.active && (
                          <span className="status inactive">Inactive</span>
                        )}
                        {membership.onHold && (
                          <span className="status on-hold">On Hold</span>
                        )}
                      </div>
                    </div>
                    <div className="membership-details">
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
                      <div>
                        <div className="membership-details">
                          <div className="detail-row"></div>
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
                        <div className="membership-details">
                          <div className="detail-row">
                            <span className="detail-label">
                              Assignments Completed:
                            </span>
                            <span className="detail-value">
                              {membership.assignmentsCompleted}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">
                              Private Calls Completed:
                            </span>
                            <span className="detail-value">
                              {membership.callsCompleted}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {contextual ===
                      `edit-membership-${membership.recordId}` && (
                      <StudentMembershipContextual membership={membership} />
                    )}
                    {selectedMembershipId === membership.recordId && (
                      <div className="membership-weeks">
                        <MembershipWeeks
                          membershipId={membership.recordId}
                          studentName={student}
                        />
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

function StudentMembershipContextual({
  membership,
}: {
  membership: Membership;
}) {
  const { closeContextual } = useContextualMenu();
  const { courseListQuery } = useCourseList();
  const [endDate, setEndDate] = useState(membership.endDate as string);
  const [onHold, setOnHold] = useState(membership.onHold);
  // const [active, setActive] = useState(membership.active);
  const userDataQuery = useUserData();
  const { coachListQuery } = useCoachList();
  const { updateMembershipMutation } = useStudentMemberships(
    membership.relatedStudent,
  );
  // const [advanced, setAdvanced] = useState(membership.advancedStudent);
  const getCourseName = (courseId: number) => {
    const course = courseListQuery.data?.find((c) => c.recordId === courseId);
    return course?.name || 'Unknown Course';
  };
  const cancelEdit = () => {
    setEndDate(membership.endDate as string);
    // setActive(membership.active);
    closeContextual();
  };
  const captureSubmitForm = () => {
    updateMembershipMutation.mutate(
      {
        recordId: membership.recordId,
        endDate,
        onHold,
      },
      {
        onSuccess: () => {
          closeContextual();
        },
      },
    );
  };

  const currentUserAsQbUser = useMemo(() => {
    const possibleEmailDomains = [
      '@learncraftspanish.com',
      '@masterofmemory.com',
    ];

    if (userDataQuery.data?.emailAddress) {
      const currentUserCoach = coachListQuery.data?.find((coach) => {
        const emailPrefix = userDataQuery.data.emailAddress
          .split('@')[0]
          .toLowerCase();
        for (const domain of possibleEmailDomains) {
          if (coach.user.email.toLowerCase() === emailPrefix + domain) {
            return true;
          }
        }
        return false;
      });
      if (currentUserCoach) return currentUserCoach;
    }
  }, [userDataQuery.data, coachListQuery.data]);

  if (
    membership.primaryCoach &&
    membership.primaryCoach.toString() !== currentUserAsQbUser?.user.id &&
    userDataQuery.data?.roles.adminRole !== 'admin'
  ) {
    return (
      <div className="contextualWrapper">
        <div className="contextual">
          <h3>Unauthorized</h3>
          <p>
            Only the primary coach or an admin can edit this student's
            membership records.
          </p>
          <button onClick={closeContextual} className="redButton" type="button">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contextualWrapper">
      <div className="contextual">
        <ContextualControls />
        <h3>Edit Membership</h3>
        <TextInput
          label="Membership Name"
          value={getCourseName(membership.relatedCourse)}
          editMode={false}
          onChange={() => {}}
        />
        <Checkbox label="On Hold" value={onHold} onChange={setOnHold} />
        {userDataQuery.data?.roles.adminRole === 'admin' && (
          <DateInput value={endDate} onChange={setEndDate} label="End Date" />
        )}
        <FormControls
          editMode
          cancelEdit={cancelEdit}
          captureSubmitForm={captureSubmitForm}
        />
      </div>
    </div>
  );
}
