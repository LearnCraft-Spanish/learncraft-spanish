import type { SpellingPort } from '../ports/spellingPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { createSpellingInfrastructure } from '@infrastructure/spellingInfrastructure';
import { config } from 'src/hexagon/config';

export function useSpellingAdapter(): SpellingPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createSpellingInfrastructure(apiUrl, auth);
}
