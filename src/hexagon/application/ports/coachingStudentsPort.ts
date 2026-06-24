import type {
  BundleCredit,
  CoachingStudent,
  SrCourse,
  StudentMembership,
  TimeZone,
  UpdateCoachingStudentCommand,
} from '@learncraft-spanish/shared';

export interface CoachingStudentsPort {
  getAllCoachingStudents: () => Promise<CoachingStudent[]>;
  getAllSrCourses: () => Promise<SrCourse[]>;
  getStudentBundleCredits: (srStudentId: number) => Promise<BundleCredit[]>;
  getStudentMemberships: (srStudentId: number) => Promise<StudentMembership[]>;
  getAllTimeZones: () => Promise<TimeZone[]>;
  updateCoachingStudent: (
    cmd: UpdateCoachingStudentCommand,
  ) => Promise<CoachingStudent>;
}
