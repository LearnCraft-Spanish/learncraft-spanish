import type { ExampleRecord } from '@LearnCraft-Spanish/shared';
import type { AuthPort } from 'src/hexagon/application/ports/authPort';
import type { ExamplesPort } from '../../application/ports/examplesPort';
import { getExampleEndpoint } from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from '../http/client';

export function createExamplesInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): ExamplesPort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  return {
    getExample: (id: number) => {
      const path = getExampleEndpoint.path.replace(':id', id.toString());
      return httpClient.get<ExampleRecord>(path);
    },
  };
}
