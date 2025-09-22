import type { OfficialQuizPort } from '@application/ports/officialQuizPort';
import { createOfficialQuizInfrastructure } from '@infrastructure/officialQuizInfrastructure';
import { config } from 'src/hexagon/config';
import { useAuthAdapter } from './authAdapter';

export function useOfficialQuizAdapter(): OfficialQuizPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createOfficialQuizInfrastructure(apiUrl, auth);
}
