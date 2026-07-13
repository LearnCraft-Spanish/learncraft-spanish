import type { AuthPort } from '@application/ports/authPort';
import type { CoachingStudentsPort } from '@application/ports/coachingStudentsPort';
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
import { createHttpClient } from '@infrastructure/http/client';
import {
  createBundleCreditEndpoint,
  deleteBundleCreditEndpoint,
  getAllCoachingStudentsEndpoint,
  getAllSrCoursesEndpoint,
  getAllTimeZonesEndpoint,
  getSrStudentBundleCreditsEndpoint,
  getStudentMembershipsEndpoint,
  updateBundleCreditEndpoint,
  updateCoachingStudentEndpoint,
} from '@learncraft-spanish/shared';

export function createCoachingStudentsInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): CoachingStudentsPort {
  const httpClient = createHttpClient(apiUrl, auth);
  return {
    getAllCoachingStudents: () =>
      httpClient.get<CoachingStudent[]>(
        getAllCoachingStudentsEndpoint.path,
        getAllCoachingStudentsEndpoint.requiredScopes,
      ),
    getAllSrCourses: async () => {
      const response = await httpClient.get<SrCourse[]>(
        getAllSrCoursesEndpoint.path,
        getAllSrCoursesEndpoint.requiredScopes,
      );

      return getAllSrCoursesEndpoint.response.parse(response);
    },
    getStudentBundleCredits: (srStudentId: number) =>
      httpClient.get<BundleCredit[]>(
        getSrStudentBundleCreditsEndpoint.path.replace(
          ':srStudentId',
          String(srStudentId),
        ),
        getSrStudentBundleCreditsEndpoint.requiredScopes,
      ),
    getStudentMemberships: (srStudentId: number) =>
      httpClient.get<StudentMembership[]>(
        getStudentMembershipsEndpoint.path.replace(
          ':srStudentId',
          String(srStudentId),
        ),
        getStudentMembershipsEndpoint.requiredScopes,
      ),
    getAllTimeZones: () =>
      httpClient.get<TimeZone[]>(
        getAllTimeZonesEndpoint.path,
        getAllTimeZonesEndpoint.requiredScopes,
      ),
    updateCoachingStudent: (cmd: UpdateCoachingStudentCommand) =>
      httpClient.put<CoachingStudent>(
        updateCoachingStudentEndpoint.path,
        updateCoachingStudentEndpoint.requiredScopes,
        { student: cmd },
      ),
    createBundleCredit: (cmd: CreateBundleCreditCommand) =>
      httpClient.post<BundleCredit>(
        createBundleCreditEndpoint.path,
        createBundleCreditEndpoint.requiredScopes,
        { bundleCredit: cmd },
      ),
    updateBundleCredit: (cmd: UpdateBundleCreditCommand) =>
      httpClient.put<BundleCredit>(
        updateBundleCreditEndpoint.path,
        updateBundleCreditEndpoint.requiredScopes,
        { bundleCredit: cmd },
      ),
    deleteBundleCredit: (cmd: DeleteBundleCreditCommand) =>
      httpClient.delete<number>(
        deleteBundleCreditEndpoint.path,
        deleteBundleCreditEndpoint.requiredScopes,
        { data: cmd },
      ),
  };
}
