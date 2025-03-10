import type { Coach, Student } from 'src/types/CoachingTypes';
import React from 'react';
import { useCoachList } from 'src/hooks/CoachingData/queries';
import useActiveStudents from 'src/hooks/CoachingData/queries/useActiveStudents';

interface CoachStudentsProps {
  onStudentSelect: (studentId: string) => void;
}

const CoachStudents: React.FC<CoachStudentsProps> = ({ onStudentSelect }) => {
  const { coachListQuery } = useCoachList();
  const { activeStudentsQuery } = useActiveStudents();

  // Get the current user's email from localStorage
  const currentUserEmail = localStorage.getItem('userEmail');

  // Find the current user in the coach list
  const currentCoach = coachListQuery.data?.find(
    (coach: Coach) => coach.user.email === currentUserEmail,
  );

  if (!currentCoach || !activeStudentsQuery.isSuccess) {
    return null; // Don't render anything if user is not a coach
  }

  // Filter students where the current coach is the primary coach
  const coachStudents = activeStudentsQuery.data.filter(
    (student: Student) => student.primaryCoach?.id === currentCoach.user.id,
  );

  if (coachStudents.length === 0) {
    return (
      <div className="student-details-section">
        <h2>My Students</h2>
        <p>You don't have any students assigned to you.</p>
      </div>
    );
  }

  return (
    <div className="student-details-section">
      <h2>My Students</h2>
      <div className="coach-students-list">
        {coachStudents.map((student: Student) => (
          <div
            key={student.recordId}
            className="coach-student-card"
            onClick={() => onStudentSelect(String(student.recordId))}
          >
            <h4>{student.fullName}</h4>
            <p>{student.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoachStudents;
