import type { Student } from 'src/types/CoachingTypes';
import React, { useMemo } from 'react';
import { useActiveStudents } from 'src/hooks/CoachingData/queries';
import { useBundleCredits } from 'src/hooks/CoachingData/useBundleCredits';

export default function StudentInfoCard({ studentId }: { studentId: number }) {
  const { activeStudentsQuery } = useActiveStudents();
  const { bundleCreditsQuery } = useBundleCredits(studentId);
  const student = useMemo(
    () =>
      activeStudentsQuery.data?.find((s) => s.recordId === studentId) as
        | Student
        | undefined,
    [activeStudentsQuery.data, studentId],
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

      <div className="bundle-credits-section">
        <h3>Bundle Credits</h3>
        {bundleCreditsQuery.isLoading ? (
          <div>Loading bundle credits...</div>
        ) : bundleCreditsQuery.error ? (
          <div>Error loading bundle credits</div>
        ) : bundleCreditsQuery.data && bundleCreditsQuery.data.length > 0 ? (
          <div className="bundle-credits-list">
            {bundleCreditsQuery.data.map((credit) => (
              // info to display:
              /*
              - credits used
              - credits remaining
              - total credits
              - expiration date
              - studentActive
              - expired
              */

              <div key={credit.recordId} className="info-row">
                <div className="info-label">Credits Used:</div>
                <div className="info-value">{credit.usedCredits}</div>
                <div className="info-label">Credits Remaining:</div>
                <div className="info-value">{credit.creditsRemaining}</div>
                <div className="info-label">Total Credits:</div>
                <div className="info-value">{credit.totalCredits}</div>
                <div className="info-label">Expiration Date:</div>
                <div className="info-value">
                  {credit.expiration &&
                    ` (Expires: ${new Date(credit.expiration).toLocaleDateString()})`}
                </div>
                <div className="info-label">Student Active:</div>
                <div className="info-value">{credit.studentActive}</div>
                <div className="info-label">Expired:</div>
                <div className="info-value">{credit.expired}</div>
              </div>
            ))}
          </div>
        ) : (
          <div>No bundle credits found</div>
        )}
      </div>
    </div>
  );
}
