import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useAllCoachingStudentsQuery } from '@application/queries/CoachingStudentQueries/useAllCoachingStudentsQuery';
import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import { Loading } from '@interface/components/Loading';
import React, { useMemo, useState } from 'react';
import {
  CoachStudents,
  StudentInfoCard,
  StudentMemberships,
} from 'src/components/StudentDrillDown/components';
import SectionHeader from '../SectionHeader';
import 'src/components/StudentDrillDown/StudentDrillDown.scss';

export function MyStudents() {
  const { allCoachingStudentsQuery } = useAllCoachingStudentsQuery();
  const { allCoachesQuery } = useAllCoachesQuery();
  const {
    authUser,
    isAuthenticated,
    isLoading: authLoading,
    isAdmin,
  } = useAuthAdapter();

  const isLoading =
    allCoachingStudentsQuery.isLoading ||
    allCoachesQuery.isLoading ||
    authLoading;

  const isError = allCoachingStudentsQuery.isError || allCoachesQuery.isError;

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
