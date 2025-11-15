import type { AuthPort } from '@application/ports/authPort';
import type { LessonRange } from '@application/ports/coursePort';
import type { ExamplePort } from '@application/ports/examplePort';
import type {
  ExampleTechnical,
  ExampleTextSearch,
  ExampleWithVocabulary,
  SkillTag,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  getExamplesByIdsWithTechnicalDataEndpoint,
  getExamplesByIdsWithVocabularyEndpoint,
  queryExamplesEndpoint,
  searchExamplesByTextEndpoint,
} from '@learncraft-spanish/shared';

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

    getExamplesByIds: async (ids: number[]) => {
      const response = await httpClient.post<{
        examples: ExampleWithVocabulary[];
      }>(
        getExamplesByIdsWithVocabularyEndpoint.path,
        getExamplesByIdsWithVocabularyEndpoint.requiredScopes,
        {
          ids,
        },
      );
      return response;
    },

    getExamplesForEditingByIds: async (ids: number[]) => {
      const response = await httpClient.post<{
        examples: ExampleTechnical[];
      }>(
        getExamplesByIdsWithTechnicalDataEndpoint.path,
        getExamplesByIdsWithTechnicalDataEndpoint.requiredScopes,
        { ids },
      );
      return response;
    },
    searchExamplesByText: async (
      searchText: ExampleTextSearch,
      page: number,
      limit: number,
    ) => {
      const response = await httpClient.post<{
        examples: ExampleWithVocabulary[];
      }>(
        searchExamplesByTextEndpoint.path,
        searchExamplesByTextEndpoint.requiredScopes,
        {
          searchText,
          page,
          limit,
        },
      );
      return response;
    },
  };
}
