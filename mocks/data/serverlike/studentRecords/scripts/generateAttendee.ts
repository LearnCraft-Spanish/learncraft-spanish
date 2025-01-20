import type { GroupAttendees } from '../../../../../src/types/CoachingTypes';
/* ------------------ Helper Functions ------------------ */

/* ------------------ Mock Data ------------------ */

/* ------------------ Main Function ------------------ */
function generateGroupAttendee({
  student, // week.recordId
  groupSession, // groupSession.recordId
  weekStudent, // student.fullName
  groupSessionDate,
}: {
  student: number;
  groupSession: number;
  weekStudent: string;
  groupSessionDate: Date | string;
}): GroupAttendees {
  return {
    recordId: Math.floor(Math.random() * 10000),
    groupSession,
    student,
    weekStudent,
    groupSessionDate,
  };
}

export default generateGroupAttendee;
