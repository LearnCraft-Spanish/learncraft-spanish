import type { AuthPort } from 'src/hexagon/application/ports/authPort';
import {
  addVocabularyToExampleEndpoint,
  createUnverifiedExampleEndpoint,
  getExampleEndpoint,
  getExampleSetBySpanishExampleEndpoint,
  getRecentlyEditedExamplesEndpoint,
  removeVocabularyFromExampleEndpoint,
} from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from '../http/client';

export function createUserDataInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): UserDataPort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);
}
