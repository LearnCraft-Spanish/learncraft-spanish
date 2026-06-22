// coaching interface

import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useAllCoachingStudentsQuery } from '@application/queries/CoachingStudentQueries/useAllCoachingStudentsQuery';
import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import { Loading } from '@interface/components/Loading';
import React, { useMemo, useState } from 'react';
import {
  CoachStudents,
  StudentDrillDownSearch,
  StudentInfoCard,
  StudentMemberships,
} from './components';
import './StudentDrillDown.scss';

export default function StudentDrillDown() {
  const { allCoachingStudentsQuery } = useAllCoachingStudentsQuery();
  const { allCoachesQuery } = useAllCoachesQuery();

  const {
    isLoading: authLoading,
    isAuthenticated,
    isAdmin,
    authUser,
  } = useAuthAdapter();

  const isLoading =
    allCoachingStudentsQuery.isLoading ||
    allCoachesQuery.isLoading ||
    authLoading;

  const isError =
    allCoachingStudentsQuery.isError || allCoachesQuery.isError || authLoading;

  const isSuccess =
    allCoachingStudentsQuery.isSuccess &&
    allCoachesQuery.isSuccess &&
    isAuthenticated;

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
      allCoachingStudentsQuery.data?.find(
        (s) => s.student_id === selectedStudentId,
      ),
    [allCoachingStudentsQuery.data, selectedStudentId],
  );

  const currentCoach = useMemo(() => {
    const possibleEmailDomains = [
      '@learncraftspanish.com',
      '@masterofmemory.com',
    ];

    if (authUser?.email) {
      const currentUserCoach = allCoachesQuery.data?.find((coach) => {
        const emailPrefix = authUser.email.split('@')[0].toLowerCase();
        for (const domain of possibleEmailDomains) {
          if (coach.email.toLowerCase() === emailPrefix + domain) {
            return true;
          }
        }
        return false;
      });
      if (currentUserCoach) return currentUserCoach;
    }
  }, [authUser, allCoachesQuery.data]);

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
                  studentName={selectedStudent.fullName}
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
