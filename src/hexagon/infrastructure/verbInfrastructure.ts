import type { AuthPort } from '@application/ports/authPort';
import type { VerbPort } from '@application/ports/verbPort';
import type { CreateVerb, Verb } from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  createVerbEndpoint,
  listVerbsEndpoint,
} from '@learncraft-spanish/shared';

export function createVerbInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): VerbPort {
  const httpClient = createHttpClient(apiUrl, auth);
  return {
    getVerbs: async (): Promise<Verb[]> => {
      return httpClient.get<Verb[]>(
        listVerbsEndpoint.path,
        listVerbsEndpoint.requiredScopes,
      );
    },
    createVerb: async (verb: CreateVerb): Promise<Verb> => {
      return httpClient.post<Verb>(
        createVerbEndpoint.path,
        createVerbEndpoint.requiredScopes,
        verb,
      );
    },
  };
}
