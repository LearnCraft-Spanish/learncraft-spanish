import type {
  BundleCredit,
  CoachingStudent,
  SrCourse,
  StudentMembership,
} from '@learncraft-spanish/shared';

export interface CoachingStudentsPort {
  getAllCoachingStudents: () => Promise<CoachingStudent[]>;
  getAllSrCourses: () => Promise<SrCourse[]>;
  getStudentBundleCredits: (srStudentId: number) => Promise<BundleCredit[]>;
  getStudentMemberships: (srStudentId: number) => Promise<StudentMembership[]>;
}
