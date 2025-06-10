import type { ProgramPort } from '../ports/programPort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { createProgramInfrastructure } from '@infrastructure/programInfastructure';
import { config } from 'src/hexagon/config';

/**
 * Adapter hook for program operations.
 * Connects the application layer to the infrastructure implementation.
 */
export function useProgramAdapter(): ProgramPort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createProgramInfrastructure(apiUrl, auth);
}
