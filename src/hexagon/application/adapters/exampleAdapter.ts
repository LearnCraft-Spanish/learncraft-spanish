import type { ExamplePort } from '../ports/examplePort';
import { createExampleInfrastructure } from '@infrastructure/exampleInfrastructure';
import { config } from 'src/hexagon/config';
import { useAuthAdapter } from './authAdapter';

export function useExampleAdapter(): ExamplePort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createExampleInfrastructure(apiUrl, auth);
}
