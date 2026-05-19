import type { AuthPort } from '@application/ports/authPort';
import type { StudentsPort } from '@application/ports/studentsPort';
import type {
  EditableStudent,
  NewStudent,
  Student,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  createAdminStudentEndpoint,
  getAdminStudentsEndpoint,
  updateAdminStudentEndpoint,
} from '@learncraft-spanish/shared';

export function createStudentsInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): StudentsPort {
  const http = createHttpClient(apiUrl, auth);

  return {
    getStudents: (): Promise<Student[]> =>
      http.get<Student[]>(
        getAdminStudentsEndpoint.path,
        getAdminStudentsEndpoint.requiredScopes,
      ),

    createStudent: (data: NewStudent): Promise<Student> =>
      http.post<Student>(
        createAdminStudentEndpoint.path,
        createAdminStudentEndpoint.requiredScopes,
        data,
      ),

    updateStudent: (data: EditableStudent): Promise<Student> =>
      http.put<Student>(
        updateAdminStudentEndpoint.path,
        updateAdminStudentEndpoint.requiredScopes,
        data,
      ),
  };
}
