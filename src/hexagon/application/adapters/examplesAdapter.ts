import { createExamplesInfrastructure } from '@infrastructure/examples/examplesInfastructure';
import { config } from 'src/hexagon/config';
import { useAuthAdapter } from './authAdapter';

export function useExamplesAdapter() {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createExamplesInfrastructure(apiUrl, auth);
}
