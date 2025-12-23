import type { ExamplePort } from '@application/ports/examplePort';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { config } from '@config';
import { createExampleInfrastructure } from '@infrastructure/exampleInfrastructure';

export function useExampleAdapter(): ExamplePort {
  const apiUrl = config.backendDomain;
  const auth = useAuthAdapter();
  return createExampleInfrastructure(apiUrl, auth);
}
