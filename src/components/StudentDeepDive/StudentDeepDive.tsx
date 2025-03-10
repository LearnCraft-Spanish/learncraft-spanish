import React, { useState } from 'react';
import StudentDeepDiveSearch from './StudentDeepDiveSearch';
import StudentInfoCard from './StudentInfoCard';
import StudentMemberships from './StudentMemberships';
import './StudentDeepDive.css';

const StudentDeepDive: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  return (
    <div className="student-deep-dive">
      <h1>Student Deep Dive</h1>
      <div className="content">
        <div className="student-selection-section">
          <h2>Select a Student</h2>
          <StudentDeepDiveSearch
            onStudentSelect={handleStudentSelect}
            selectedStudentId={selectedStudentId}
          />
        </div>
        {selectedStudentId && (
          <>
            <div className="student-details-section">
              <h2>Student Details</h2>
              <StudentInfoCard studentId={selectedStudentId} />
            </div>
            <div className="student-details-section">
              <StudentMemberships studentId={selectedStudentId} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDeepDive;
