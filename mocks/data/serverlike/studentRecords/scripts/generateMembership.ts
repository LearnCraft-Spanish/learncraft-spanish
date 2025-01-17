import type { Membership, Week } from '../../../../../src/types/CoachingTypes';
/* ------------------ Helper Functions ------------------ */

/* ------------------ Mock Data ------------------ */

/* ------------------ Main Function ------------------ */
function generateMembership({
  week,
  startDate,
  endDate,
  relatedCourseId,
  relatedStudentId,
}: {
  week: Week;
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
    lastRecordedWeekStarts: week.weekStarts,
    relatedCourse: relatedCourseId,
    relatedStudent: relatedStudentId,
  };
  return membership;
}

export default generateMembership;
