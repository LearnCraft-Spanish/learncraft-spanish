import type { Student } from 'src/types/CoachingTypes';
import React, { useMemo, useState } from 'react';
import { Loading } from 'src/components/Loading';
import {
  CoachStudents,
  StudentInfoCard,
  StudentMemberships,
} from 'src/components/StudentDrillDown/components';
import {
  useActiveStudents,
  useCoachList,
} from 'src/hooks/CoachingData/queries';
import { useAllStudents } from 'src/hooks/CoachingData/queries/StudentDrillDown';
import { useUserData } from 'src/hooks/UserData/useUserData';
import SectionHeader from '../SectionHeader';
import 'src/components/StudentDrillDown/StudentDrillDown.scss';

export function MyStudents() {
  const { allStudentsQuery } = useAllStudents();
  const { coachListQuery } = useCoachList();
  const { activeStudentsQuery } = useActiveStudents();
  const userDataQuery = useUserData();

  const isLoading =
    allStudentsQuery.isLoading ||
    coachListQuery.isLoading ||
    activeStudentsQuery.isLoading ||
    userDataQuery.isLoading;

  const isError =
    allStudentsQuery.isError ||
    coachListQuery.isError ||
    activeStudentsQuery.isError ||
    userDataQuery.isError;

  const isSuccess =
    allStudentsQuery.isSuccess &&
    coachListQuery.isSuccess &&
    activeStudentsQuery.isSuccess &&
    userDataQuery.isSuccess;

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
      <h1>Student Drill Down</h1>
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
  const [isOpen, setIsOpen] = useState(true);
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
