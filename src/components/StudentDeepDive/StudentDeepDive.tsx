import React, { useState } from 'react';

import pencil from 'src/assets/icons/pencil.svg';

import { useContextualMenu } from 'src/hooks/useContextualMenu';
import {
  CoachStudents,
  StudentDeepDiveSearch,
  StudentInfoCard,
  StudentInfoContextual,
  StudentMemberships,
} from './components';
import './StudentDeepDive.scss';

export default function StudentDeepDive() {
  const { contextual, openContextual } = useContextualMenu();
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
              <div className="edit-student">
                <img
                  src={pencil}
                  alt="Edit Student"
                  onClick={() => openContextual('edit-student')}
                />
              </div>
              <h2>Student Details</h2>
              <StudentInfoCard studentId={selectedStudentId} />
              {contextual === 'edit-student' && (
                <StudentInfoContextual studentId={selectedStudentId} />
              )}
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
    </div>
  );
}
