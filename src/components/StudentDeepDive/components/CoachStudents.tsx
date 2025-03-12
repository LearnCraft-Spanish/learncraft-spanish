import type { Coach, Student } from 'src/types/CoachingTypes';
import React, { useMemo } from 'react';
import { useCoachList } from 'src/hooks/CoachingData/queries';
import useActiveStudents from 'src/hooks/CoachingData/queries/useActiveStudents';
import { useUserData } from 'src/hooks/UserData/useUserData';

export default function CoachStudents({
  onStudentSelect,
}: {
  onStudentSelect: (studentId: number | undefined) => void;
}) {
  const { coachListQuery } = useCoachList();
  const { activeStudentsQuery } = useActiveStudents();
  const userDataQuery = useUserData();

  // null if not ready, undefined if not a coach
  const currentCoach = useMemo(() => {
    if (!userDataQuery.isSuccess || !coachListQuery.isSuccess) {
      return null;
    }

    return coachListQuery.data?.find(
      (coach: Coach) => coach.user.email === userDataQuery.data.emailAddress,
    );
  }, [
    coachListQuery.data,
    coachListQuery.isSuccess,
    userDataQuery.data,
    userDataQuery.isSuccess,
  ]);

  // Filter students where the current coach is the primary coach
  const coachStudents = useMemo(() => {
    if (!activeStudentsQuery.isSuccess || !currentCoach) {
      return [];
    }

    return activeStudentsQuery.data.filter(
      (student: Student) => student.primaryCoach?.id === currentCoach.user.id,
    );
  }, [activeStudentsQuery.data, activeStudentsQuery.isSuccess, currentCoach]);

  if (!currentCoach) {
    return null;
  }

  return (
    <div className="student-details-section">
      <h2>My Active Students</h2>
      {coachStudents.length === 0 ? (
        <p>You don't have any active students assigned to you.</p>
      ) : (
        <div className="coach-students-list">
          {coachStudents.map((student: Student) => (
            <div
              key={student.recordId}
              className="coach-student-card"
              onClick={() => onStudentSelect(student.recordId)}
            >
              <h4>{student.fullName}</h4>
              <p>{student.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
