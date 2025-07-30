import type {
  ExampleWithVocabulary,
  SkillTag,
} from '@learncraft-spanish/shared';
import type { AuthPort } from '../application/ports/authPort';
import type { ExamplePort } from '../application/ports/examplePort';
import { createHttpClient } from '@infrastructure/http/client';
import { queryExamplesEndpoint } from '@learncraft-spanish/shared';

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

      page: number;
      limit: number;
      seed?: string;
    }) => {
      const response = await httpClient.post<{
        examples: ExampleWithVocabulary[];
        totalCount: number;
      }>(queryExamplesEndpoint.path, queryExamplesEndpoint.requiredScopes, {
        page: params.page,
        limit: params.limit,
        filters: {
          courseId: params.courseId,
          toLessonNumber: params.toLessonNumber,
          fromLessonNumber: params.fromLessonNumber,
          includeSpanglish: params.includeSpanglish,
          audioOnly: params.audioOnly,
          skillTags: params.skillTags,
        },
        seed: params.seed,
      });
      return response;
    },
  };
}
