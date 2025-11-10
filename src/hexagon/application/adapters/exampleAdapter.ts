import type { ExamplePort } from '../ports/examplePort';
import { config } from '@config';
import { createExampleInfrastructure } from '@infrastructure/exampleInfrastructure';
import { useAuthAdapter } from './authAdapter';

export function useExampleAdapter(): ExamplePort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createExampleInfrastructure(apiUrl, auth);
}
