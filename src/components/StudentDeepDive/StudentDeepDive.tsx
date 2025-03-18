import React, { useMemo, useState } from 'react';
import {
  CoachStudents,
  StudentDeepDiveSearch,
  StudentInfoCard,
  StudentMemberships,
} from './components';
import { useAllStudents } from 'src/hooks/CoachingData/queries/StudentDeepDive';
import { Student } from 'src/types/CoachingTypes';
import { useUserData } from 'src/hooks/UserData/useUserData';
import { useCoachList } from 'src/hooks/CoachingData/queries';
import './StudentDeepDive.scss';

export default function StudentDeepDive() {
  const { allStudentsQuery } = useAllStudents();
  const userDataQuery = useUserData();
  const { coachListQuery } = useCoachList();

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

  return (
    <div className="student-deep-dive">
      <h1>Student Deep Dive</h1>
      <div className="content">
        <CoachStudents
          onStudentSelect={handleStudentSelect}
          currentCoach={currentCoach}
        />
        <div className="student-selection-section">
          <h2>Select a Student</h2>
          <StudentDeepDiveSearch
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
                isAdmin={userDataQuery.data?.roles.adminRole === 'admin'}
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
    </div>
  );
}
