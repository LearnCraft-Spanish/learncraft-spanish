import type {
  ExampleWithVocabulary,
  SkillTag,
} from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../application/ports/authPort';
import type { ExamplePort } from '../application/ports/examplePort';
import { createHttpClient } from '@infrastructure/http/client';
import { queryExamplesEndpoint } from '@LearnCraft-Spanish/shared';

export function createExampleInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): ExamplePort {
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getFilteredExamples: async (params: {
      courseId: number;
      toLessonNumber: number;
      fromLessonNumber?: number;
      includeSpanglish?: boolean;
      audioOnly?: boolean;
      skillTags?: SkillTag[];
    }) => {
      const response = await httpClient.post<{
        examples: ExampleWithVocabulary[];
        totalCount: number;
      }>(queryExamplesEndpoint.path, queryExamplesEndpoint.requiredScopes, {
        page: 1,
        limit: 100,
        filters: params,
        seed: crypto.randomUUID(),
      });
      return response;
    },
  };
}
