import type { StudentsPort } from '@application/ports/studentsPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createStudentsInfrastructure } from '@infrastructure/studentsInfrastructure';

export function useStudentsAdapter(): StudentsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createStudentsInfrastructure(apiUrl, auth);
}
