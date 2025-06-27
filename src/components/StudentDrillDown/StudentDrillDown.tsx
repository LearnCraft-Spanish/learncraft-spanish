import type { Student } from 'src/types/CoachingTypes';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import React, { useMemo, useState } from 'react';
import { Loading } from 'src/components/Loading';
import { useCoachList } from 'src/hooks/CoachingData/queries';
import { useAllStudents } from 'src/hooks/CoachingData/queries/StudentDrillDown';
import {
  CoachStudents,
  StudentDrillDownSearch,
  StudentInfoCard,
  StudentMemberships,
} from './components';
import './StudentDrillDown.scss';

export default function StudentDrillDown() {
  const { allStudentsQuery } = useAllStudents();
  const { coachListQuery } = useCoachList();

  const {
    isLoading: authLoading,
    isAuthenticated,
    isAdmin,
    authUser,
  } = useAuthAdapter();

  const isLoading =
    allStudentsQuery.isLoading || coachListQuery.isLoading || authLoading;

  const isError =
    allStudentsQuery.isError || coachListQuery.isError || authLoading;

  const isSuccess =
    allStudentsQuery.isSuccess && coachListQuery.isSuccess && isAuthenticated;

  const [selectedStudentId, setSelectedStudentId] = useState<
    number | undefined
  >(undefined);
  const [selectedMembershipId, setSelectedMembershipId] = useState<
    number | undefined
  >(undefined);

  const handleStudentSelect = (studentId: number | undefined) => {
    setSelectedStudentId(studentId);
    setSelectedMembershipId(undefined); // Reset membership selection when student changes
  };

  const handleMembershipSelect = (membershipId: number | undefined) => {
    setSelectedMembershipId(membershipId);
  };

  const selectedStudent = useMemo(
    () =>
      allStudentsQuery.data?.find((s) => s.recordId === selectedStudentId) as
        | Student
        | undefined,
    [allStudentsQuery.data, selectedStudentId],
  );

  const currentCoach = useMemo(() => {
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

  return (
    <div className="student-deep-dive">
      <h1>Student Drill Down</h1>
      {isLoading && <Loading message="Loading data..." />}
      {isError && <div>Error loading data, please try again.</div>}
      {isSuccess && (
        <div className="content">
          <CoachStudents
            onStudentSelect={handleStudentSelect}
            currentCoach={currentCoach}
          />
          <div className="student-selection-section">
            <h2>Select a Student</h2>
            <StudentDrillDownSearch
              onStudentSelect={handleStudentSelect}
              selectedStudentId={selectedStudentId}
            />
          </div>
          {selectedStudentId && selectedStudent && (
            <>
              <div className="student-details-section">
                <StudentInfoCard
                  student={selectedStudent}
                  currentCoach={currentCoach}
                  isAdmin={isAdmin}
                />
              </div>
              <div>
                <StudentMemberships
                  studentId={selectedStudentId}
                  selectedMembershipId={selectedMembershipId}
                  onMembershipSelect={handleMembershipSelect}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
