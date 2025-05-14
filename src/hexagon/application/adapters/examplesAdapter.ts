import { useAuthAdapter } from '@application/adapters/authAdapter';
import { createExamplesInfrastructure } from '@infrastructure/examples/examplesInfastructure';
import { config } from 'src/hexagon/config';

export function useExamplesAdapter() {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();

  return createExamplesInfrastructure(apiUrl, auth);
}
