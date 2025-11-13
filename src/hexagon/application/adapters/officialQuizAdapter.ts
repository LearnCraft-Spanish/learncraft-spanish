import type { OfficialQuizPort } from '@application/ports/officialQuizPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createOfficialQuizInfrastructure } from '@infrastructure/officialQuizInfrastructure';

export function useOfficialQuizAdapter(): OfficialQuizPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createOfficialQuizInfrastructure(apiUrl, auth);
}
