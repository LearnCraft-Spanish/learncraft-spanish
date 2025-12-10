import type { Membership } from 'src/types/CoachingTypes';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { InlineLoading } from '@interface/components/Loading';
import React, { useMemo, useState } from 'react';
import downArrow from 'src/assets/icons/down-arrow.svg';
import pencilIcon from 'src/assets/icons/pencil.svg';
import {
  Checkbox,
  DateInput,
  Dropdown,
  FormControls,
  TextInput,
} from 'src/components/FormComponents';
import { toISODate } from 'src/hexagon/domain/functions/dateUtils';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import { useCoachList, useCourseList } from 'src/hooks/CoachingData/queries';
import {
  useAllStudents,
  useMembershipWeeks,
  useStudentMemberships,
} from 'src/hooks/CoachingData/queries/StudentDrillDown';
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
                      {/* // Foreign Key lookup, form data in backend */}
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
                          <div className="membership-details">
                            <div className="detail-row">
                              <span className="detail-label">
                                Total Strategy Calls:
                              </span>
                              <span className="detail-value">
                                {membership.totalStrategyCalls}
                              </span>
                            </div>
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
  const { openModal, closeModal } = useModal();
  const [startDate, setStartDate] = useState(membership.startDate as string);
  const [endDate, setEndDate] = useState(membership.endDate as string);
  const [onHold, setOnHold] = useState(membership.onHold);
  const [selectedCourse, setSelectedCourse] = useState(
    membership.relatedCourse,
  );
  const { isAdmin, authUser } = useAuthAdapter();
  const { coachListQuery } = useCoachList();
  const { updateMembershipMutation } = useStudentMemberships(
    membership.relatedStudent,
  );
  const membershipWeeksQuery = useMembershipWeeks(membership.recordId);
  // const [advanced, setAdvanced] = useState(membership.advancedStudent);
  const getCourseName = (courseId: number) => {
    const course = courseListQuery.data?.find((c) => c.recordId === courseId);
    return course?.name || 'Unknown Course';
  };

  const courseOptions = useMemo(() => {
    if (!courseListQuery.data) return [];
    return courseListQuery.data.map((course) => course.name);
  }, [courseListQuery.data]);

  const courseIdByName = useMemo(() => {
    if (!courseListQuery.data) return new Map();
    return new Map(
      courseListQuery.data.map((course) => [course.name, course.recordId]),
    );
  }, [courseListQuery.data]);

  const courseNameById = useMemo(() => {
    if (!courseListQuery.data) return new Map();
    return new Map(
      courseListQuery.data.map((course) => [course.recordId, course.name]),
    );
  }, [courseListQuery.data]);

  const cancelEdit = () => {
    setEndDate(membership.endDate as string);
    setStartDate(membership.startDate as string);
    setSelectedCourse(membership.relatedCourse);
    // setActive(membership.active);
    closeContextual();
  };

  const captureSubmitForm = () => {
    updateMembershipMutation.mutate(
      {
        recordId: membership.recordId,
        startDate,
        endDate,
        onHold,
        relatedCourse: selectedCourse,
      },
      {
        onSuccess: () => {
          membershipWeeksQuery.refetch();
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

    if (authUser?.email) {
      const currentUserCoach = coachListQuery.data?.find((coach) => {
        const emailPrefix = authUser.email.split('@')[0].toLowerCase();
        for (const domain of possibleEmailDomains) {
          if (coach.user.email.toLowerCase() === emailPrefix + domain) {
            return true;
          }
        }
        return false;
      });
      if (currentUserCoach) return currentUserCoach;
    }
  }, [authUser, coachListQuery.data]);

  const handleCourseChange = (courseName: string) => {
    const newCourseId = courseIdByName.get(courseName);
    if (!newCourseId) return;

    openModal({
      title: 'Confirm Course Change',
      body: `If you edit this membership, it will also affect all related week records back to ${toISODate(new Date(membership.startDate))}. Do you wish to continue?`,
      type: 'confirm',
      confirmFunction: () => {
        setSelectedCourse(newCourseId);
        closeModal();
      },
      cancelFunction: () => {
        /* Do nothing, keep existing course */
      },
    });
  };

  if (
    membership.primaryCoach &&
    membership.primaryCoach.toString() !== currentUserAsQbUser?.user.id &&
    isAdmin
  ) {
    return (
      <ContextualView>
        <h3>Unauthorized</h3>
        <p>
          Only the primary coach or an admin can edit this student's membership
          records.
        </p>
        <button onClick={closeContextual} className="redButton" type="button">
          Close
        </button>
      </ContextualView>
    );
  }

  return (
    <ContextualView>
      <h3>Edit Membership</h3>
      {isAdmin ? (
        <Dropdown
          label="Course"
          value={courseNameById.get(selectedCourse)}
          onChange={handleCourseChange}
          options={courseOptions}
          editMode
        />
      ) : (
        <TextInput
          label="Membership Name"
          // Foreign Key lookup, form data in backend
          value={getCourseName(membership.relatedCourse)}
          editMode={false}
          onChange={() => {}}
        />
      )}
      <Checkbox
        labelText="On Hold"
        labelFor="onHold"
        value={onHold}
        onChange={setOnHold}
      />
      {isAdmin && (
        <>
          <DateInput
            value={startDate}
            onChange={setStartDate}
            label="Start Date"
          />
          <DateInput value={endDate} onChange={setEndDate} label="End Date" />
        </>
      )}
      <FormControls
        editMode
        cancelEdit={cancelEdit}
        captureSubmitForm={captureSubmitForm}
      />
    </ContextualView>
  );
}
