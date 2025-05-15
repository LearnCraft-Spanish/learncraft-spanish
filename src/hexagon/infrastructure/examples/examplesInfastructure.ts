import type { AuthPort } from 'src/hexagon/application/ports/authPort';
import type { ExamplesPort } from '../../application/ports/examplesPort';
import {
  addVocabularyToExampleEndpoint,
  createUnverifiedExampleEndpoint,
  getExampleEndpoint,
  getExampleSetBySpanishExampleEndpoint,
  getRecentlyEditedExamplesEndpoint,
  removeVocabularyFromExampleEndpoint,
} from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from '../http/client';

export function createExamplesInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): ExamplesPort {
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  return {
    getExample: (id) => {
      const path = getExampleEndpoint.path.replace(':id', id.toString());
      return httpClient.get(path);
    },
    createUnverifiedExample: (example) => {
      return httpClient.post(createUnverifiedExampleEndpoint.path, example);
    },
    updateExample: (example) => {
      const path = getExampleEndpoint.path.replace(
        ':id',
        example.recordId.toString(),
      );
      return httpClient.put(path, example);
    },
    addVocabularyToExample: (exampleId, vocabIdList) => {
      const path = addVocabularyToExampleEndpoint.path;
      return httpClient.post(path, { exampleId, vocabIdList });
    },
    removeVocabularyFromExample: (exampleId, vocabIdList) => {
      const path = removeVocabularyFromExampleEndpoint.path;
      return httpClient.post(path, { exampleId, vocabIdList });
    },
    getRecentlyEditedExamples: () => {
      const path = getRecentlyEditedExamplesEndpoint.path;
      return httpClient.get(path);
    },
    getExampleSetBySpanishText: (spanishExamples) => {
      const path = getExampleSetBySpanishExampleEndpoint.path;
      return httpClient.post(path, { spanishExamples });
    },
  };
}
