import type { Student } from 'src/types/CoachingTypes';
import React from 'react';
import { useActiveStudents } from 'src/hooks/CoachingData/queries';

interface StudentInfoCardProps {
  studentId: string;
}

const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ studentId }) => {
  const { activeStudentsQuery } = useActiveStudents();
  const student = activeStudentsQuery.data?.find(
    (s) => s.recordId === Number(studentId),
  ) as Student | undefined;

  if (!student) {
    return <div>Loading student information...</div>;
  }

  return (
    <div className="student-info-card">
      <div className="info-row">
        <div className="info-label">Name:</div>
        <div className="info-value">{student.fullName}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Email:</div>
        <div className="info-value">{student.email}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Fluency Goal:</div>
        <div className="info-value">{student.fluencyGoal || 'Not set'}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Time Zone:</div>
        <div className="info-value">{student.timeZone || 'Not set'}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Starting Level:</div>
        <div className="info-value">{student.startingLevel || 'Not set'}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Primary Coach:</div>
        <div className="info-value">
          {student.primaryCoach ? student.primaryCoach.name : 'Not assigned'}
        </div>
      </div>
    </div>
  );
};

export default StudentInfoCard;
