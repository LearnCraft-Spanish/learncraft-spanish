import type { SrLessonsPort } from '@application/ports/srLessonsPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createSrLessonsInfrastructure } from '@infrastructure/srLessonsInfrastructure';

export function useSrLessonsAdapter(): SrLessonsPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();

  return createSrLessonsInfrastructure(apiUrl, auth);
}
