import type { Coach, CoachingStudent } from '@learncraft-spanish/shared';
import { useAllCoachingStudentsQuery } from '@application/queries/CoachingStudentQueries/useAllCoachingStudentsQuery';
import React, { useMemo } from 'react';

export default function CoachStudents({
  onStudentSelect,
  currentCoach,
}: {
  onStudentSelect: (studentId: number | undefined) => void;
  currentCoach: Coach | undefined;
}) {
  const { allCoachingStudentsQuery } = useAllCoachingStudentsQuery();

  // Filter students where the current coach is the primary coach
  const coachStudents = useMemo(() => {
    if (!allCoachingStudentsQuery.isSuccess || !currentCoach) {
      return [];
    }

    return allCoachingStudentsQuery.data.filter(
      (student: CoachingStudent) =>
        student.primaryCoach?.coach_id === currentCoach.coach_id,
    );
  }, [
    allCoachingStudentsQuery.data,
    allCoachingStudentsQuery.isSuccess,
    currentCoach,
  ]);

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
          {coachStudents.map((student: CoachingStudent) => (
            <div
              key={student.student_id}
              className="coach-student-card"
              onClick={() => onStudentSelect(student.student_id)}
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
