import React, { useState } from 'react';
import CoachStudents from './CoachStudents';
import MembershipWeeks from './MembershipWeeks';
import StudentDeepDiveSearch from './StudentDeepDiveSearch';
import StudentInfoCard from './StudentInfoCard';
import StudentMemberships from './StudentMemberships';
import './StudentDeepDive.css';

const StudentDeepDive: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >();
  const [selectedMembershipId, setSelectedMembershipId] = useState<
    number | null
  >(null);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSelectedMembershipId(null); // Reset membership selection when student changes
  };

  const handleMembershipSelect = (membershipId: number | null) => {
    setSelectedMembershipId(membershipId);
  };

  return (
    <div className="student-deep-dive">
      <h1>Student Deep Dive</h1>
      <div className="content">
        <CoachStudents onStudentSelect={handleStudentSelect} />
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
              <StudentMemberships
                studentId={selectedStudentId}
                selectedMembershipId={selectedMembershipId}
                onMembershipSelect={handleMembershipSelect}
              />
            </div>
            {selectedMembershipId && (
              <div className="student-details-section">
                <h2>Membership Weeks</h2>
                <MembershipWeeks membershipId={selectedMembershipId} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDeepDive;
