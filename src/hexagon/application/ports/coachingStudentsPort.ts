import type {
  BundleCredit,
  CoachingStudent,
  CreateBundleCreditCommand,
  DeleteBundleCreditCommand,
  SrCourse,
  StudentMembership,
  TimeZone,
  UpdateBundleCreditCommand,
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
  createBundleCredit: (cmd: CreateBundleCreditCommand) => Promise<BundleCredit>;
  updateBundleCredit: (cmd: UpdateBundleCreditCommand) => Promise<BundleCredit>;
  deleteBundleCredit: (cmd: DeleteBundleCreditCommand) => Promise<number>;
}
