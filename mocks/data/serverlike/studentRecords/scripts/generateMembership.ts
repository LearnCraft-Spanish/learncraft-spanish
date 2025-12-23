import type { Membership } from 'src/types/CoachingTypes';
/* ------------------ Helper Functions ------------------ */

/* ------------------ Mock Data ------------------ */

/* ------------------ Main Function ------------------ */
function generateMembership({
  // week,
  startDate,
  endDate,
  relatedCourseId,
  relatedStudentId,
}: {
  // week: Week;
  startDate: string;
  endDate: string;
  relatedCourseId: number;
  relatedStudentId: number;
}): Membership {
  const membership = {
    recordId: Math.floor(Math.random() * 10000),
    active: true,
    onHold: false,
    startDate,
    endDate,
    lastRecordedWeekStarts: '',
    relatedCourse: relatedCourseId,
    relatedStudent: relatedStudentId,
    assignmentsCompleted: 0,
    callsCompleted: 0,
    totalStrategyCalls: 0,
    primaryCoach: 0,
  };
  return membership;
}

export default generateMembership;
