import type {
  ExampleWithVocabulary,
  SkillTag,
} from '@learncraft-spanish/shared';
import type { AuthPort } from '../application/ports/authPort';
import type { LessonRange } from '../application/ports/coursePort';
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
      lessonRanges: LessonRange[];
      excludeSpanglish?: boolean;
      audioOnly?: boolean;
      skillTags?: SkillTag[];
      page: number;
      limit: number;
      seed: string;
      disableCache?: boolean;
    }) => {
      // Always use lesson ranges - no more backward compatibility
      const filters = {
        lessonRanges: params.lessonRanges,
        excludeSpanglish: params.excludeSpanglish,
        audioOnly: params.audioOnly,
        skillTags: params.skillTags,
      };

      const response = await httpClient.post<{
        examples: ExampleWithVocabulary[];
        totalCount: number;
      }>(queryExamplesEndpoint.path, queryExamplesEndpoint.requiredScopes, {
        page: params.page,
        limit: params.limit,
        filters,
        seed: params.seed,
        disableCache: params.disableCache ?? false,
      });
      return response;
    },
  };
}
