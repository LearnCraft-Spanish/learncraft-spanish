import type { OfficialQuizPort } from '@application/ports/officialQuizPort';
import { config } from '@config';
import { createOfficialQuizInfrastructure } from '@infrastructure/officialQuizInfrastructure';
import { useAuthAdapter } from './authAdapter';

export function useOfficialQuizAdapter(): OfficialQuizPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createOfficialQuizInfrastructure(apiUrl, auth);
}
