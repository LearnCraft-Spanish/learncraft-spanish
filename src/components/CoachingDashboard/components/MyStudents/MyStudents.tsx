import type { Student } from 'src/types/CoachingTypes';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import React, { useMemo, useState } from 'react';
import { Loading } from 'src/components/Loading';
import {
  CoachStudents,
  StudentInfoCard,
  StudentMemberships,
} from 'src/components/StudentDrillDown/components';
import { useCoachList } from 'src/hooks/CoachingData/queries';
import { useAllStudents } from 'src/hooks/CoachingData/queries/StudentDrillDown';
import SectionHeader from '../SectionHeader';
import 'src/components/StudentDrillDown/StudentDrillDown.scss';

export function MyStudents() {
  const { allStudentsQuery } = useAllStudents();
  const { coachListQuery } = useCoachList();
  const {
    authUser,
    isAuthenticated,
    isLoading: authLoading,
    isAdmin,
  } = useAuthAdapter();

  const isLoading =
    allStudentsQuery.isLoading || coachListQuery.isLoading || authLoading;

  const isError = allStudentsQuery.isError || coachListQuery.isError;

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
      {isLoading && <Loading message="Loading data..." />}
      {isError && <div>Error loading data, please try again.</div>}
      {isSuccess && (
        <div className="content">
          <CoachStudents
            onStudentSelect={handleStudentSelect}
            currentCoach={currentCoach}
          />
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
/*
export default function IncompleteRecordsWrapper() {
  const [isOpen, setIsOpen] = useState(true);
  const openFunctionWrapper = (_title: string) => {
    console.log('openFunctionWrapper', _title);
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <SectionHeader
        title="My Incomplete Records"
        isOpen={isOpen}
        openFunction={openFunctionWrapper}
        button={
          <div className="button">
            <Link className="linkButton" to="/weeklyrecords">
              Weekly Records Interface
            </Link>
          </div>
        }
      />
      {isOpen && <IncompleteRecords />}
    </div>
  );
}
*/

export default function MyStudentsWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const openFunctionWrapper = (_title: string) => {
    setIsOpen(!isOpen);
  };
  return (
    <div>
      <SectionHeader
        title="My Students"
        isOpen={isOpen}
        openFunction={openFunctionWrapper}
      />
      {isOpen && <MyStudents />}
    </div>
  );
}
