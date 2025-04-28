import type { VocabRecordWithSpellings } from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../../application/ports/authPort';
import type { FrequensayPort } from '../../application/ports/frequensayPort';
import { frequensayEndpoints } from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from '../http/client';

export function createFrequensayInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): FrequensayPort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  return {
    getFrequensayVocabulary: async () => {
      const response = await httpClient.get<VocabRecordWithSpellings[]>(
        frequensayEndpoints.listFrequensayVocabulary.path,
      );
      return response;
    },
  };
}
