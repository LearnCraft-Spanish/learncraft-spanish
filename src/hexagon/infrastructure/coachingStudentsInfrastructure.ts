import type { AuthPort } from '@application/ports/authPort';
import type { CoachingStudentsPort } from '@application/ports/coachingStudentsPort';
import type {
  BundleCredit,
  CoachingStudent,
  SrCourse,
  StudentMembership,
  TimeZone,
  UpdateCoachingStudentCommand,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  getAllCoachingStudentsEndpoint,
  getAllSrCoursesEndpoint,
  getAllTimeZonesEndpoint,
  getSrStudentBundleCreditsEndpoint,
  getStudentMembershipsEndpoint,
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
    getAllSrCourses: () =>
      httpClient.get<SrCourse[]>(
        getAllSrCoursesEndpoint.path,
        getAllSrCoursesEndpoint.requiredScopes,
      ),
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
  };
}
