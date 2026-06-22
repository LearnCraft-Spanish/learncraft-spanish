import type { CoachingStudent } from '@learncraft-spanish/shared';

export interface CoachingStudentsPort {
  getAllCoachingStudents: () => Promise<CoachingStudent[]>;
}
