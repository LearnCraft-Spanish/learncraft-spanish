import type { SpellingPort } from '@application/ports/spellingPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createSpellingInfrastructure } from '@infrastructure/spellingInfrastructure';

export function useSpellingAdapter(): SpellingPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createSpellingInfrastructure(apiUrl, auth);
}
