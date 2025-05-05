import type { Coach, Student } from 'src/types/CoachingTypes';
import React, { useMemo } from 'react';
import { useAllStudents } from 'src/hooks/CoachingData/queries/StudentDrillDown';
export default function CoachStudents({
  onStudentSelect,
  currentCoach,
}: {
  onStudentSelect: (studentId: number | undefined) => void;
  currentCoach: Coach | undefined;
}) {
  // const { activeStudentsQuery } = useActiveStudents();
  const { allStudentsQuery } = useAllStudents();

  // Filter students where the current coach is the primary coach
  const coachStudents = useMemo(() => {
    if (!allStudentsQuery.isSuccess || !currentCoach) {
      return [];
    }

    return allStudentsQuery.data.filter(
      (student: Student) => student.primaryCoach?.id === currentCoach.user.id,
    );
  }, [allStudentsQuery.data, allStudentsQuery.isSuccess, currentCoach]);

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
