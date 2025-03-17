import type { Student } from 'src/types/CoachingTypes';
import React, { useMemo } from 'react';
import { toISODate } from 'src/functions/dateUtils';
import { useAllStudents } from 'src/hooks/CoachingData/queries/useStudentDeepDive';
import { BundleCreditsSection } from './BundleCreditsSection';

export default function StudentInfoCard({ studentId }: { studentId: number }) {
  const allStudentsQuery = useAllStudents();
  const student = useMemo(
    () =>
      allStudentsQuery.data?.find((s) => s.recordId === studentId) as
        | Student
        | undefined,
    [allStudentsQuery.data, studentId],
  );

  if (!student) {
    return (
      <div>
        Error retrieving student information, please report this to support.
      </div>
    );
  }

  return (
    <div className="student-info-card">
      <div className="info-row">
        <div className="info-label">Name:</div>
        <div className="info-value">{student.fullName}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Pronoun:</div>
        <div className="info-value">{student.pronoun}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Email:</div>
        <div className="info-value">{student.email}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Fluency Goal:</div>
        <div className="info-value">{student.fluencyGoal}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Time Zone:</div>
        <div className="info-value">{student.timeZone}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Starting Level:</div>
        <div className="info-value">{student.startingLevel}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Primary Coach:</div>
        <div className="info-value">
          {student.primaryCoach ? student.primaryCoach.name : 'Not assigned'}
        </div>
      </div>
      <h3>Billing Information</h3>
      <div className="info-row">
        <div className="info-label">Billing Email:</div>
        <div className="info-value">{student.billingEmail}</div>
      </div>
      <div className="info-row">
        <div className="info-label">Billing Notes:</div>
        <div className="info-value">{student.billingNotes}</div>
      </div>
      <div className="info-row">
        <div className="info-label">First Subscribed:</div>
        <div className="info-value">
          {typeof student.firstSubscribed === 'string'
            ? student.firstSubscribed
            : toISODate(student.firstSubscribed)}
        </div>
      </div>

      <BundleCreditsSection studentId={studentId} />
    </div>
  );
}
