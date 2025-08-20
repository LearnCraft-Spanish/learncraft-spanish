import type { VerbPort } from '@application/ports/verbPort';
import { createVerbInfrastructure } from '@infrastructure/verbInfrastructure';
import { config } from 'src/hexagon/config';
import { useAuthAdapter } from './authAdapter';

export function useVerbAdapter(): VerbPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createVerbInfrastructure(apiUrl, auth);
}
