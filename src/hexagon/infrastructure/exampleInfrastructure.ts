import type { AuthPort } from '@application/ports/authPort';
import type { LessonRange } from '@application/ports/coursePort';
import type { ExamplePort } from '@application/ports/examplePort';
import type {
  CreateExamplesCommand,
  ExampleTechnical,
  ExampleTextSearch,
  ExampleWithVocabulary,
  SkillTag,
  UpdateExamplesCommand,
} from '@learncraft-spanish/shared';
import { createHttpClient } from '@infrastructure/http/client';
import {
  createExamplesEndpoint,
  deleteExamplesEndpoint,
  getExamplesByIdsWithTechnicalDataEndpoint,
  getExamplesByIdsWithVocabularyEndpoint,
  getExamplesByMostRecentlyModifiedEndpoint,
  queryExamplesEndpoint,
  searchExamplesByTextEndpoint,
  updateExamplesEndpoint,
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
    }): Promise<{ examples: ExampleWithVocabulary[]; totalCount: number }> => {
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

    getExamplesByIds: async (
      ids: number[],
    ): Promise<ExampleWithVocabulary[]> => {
      const response = await httpClient.post<ExampleWithVocabulary[]>(
        getExamplesByIdsWithVocabularyEndpoint.path,
        getExamplesByIdsWithVocabularyEndpoint.requiredScopes,
        {
          ids,
        },
      );
      return response;
    },

    getExamplesForEditingByIds: async (
      ids: number[],
    ): Promise<ExampleTechnical[]> => {
      const response = await httpClient.post<ExampleTechnical[]>(
        getExamplesByIdsWithTechnicalDataEndpoint.path,
        getExamplesByIdsWithTechnicalDataEndpoint.requiredScopes,
        { ids },
      );
      return response;
    },
    searchExamplesByText: async (
      search: ExampleTextSearch,
      page: number,
      limit: number,
      vocabularyComplete?: boolean,
    ): Promise<{ examples: ExampleWithVocabulary[]; totalCount: number }> => {
      const response = await httpClient.post<{
        examples: ExampleWithVocabulary[];
        totalCount: number;
      }>(
        searchExamplesByTextEndpoint.path,
        searchExamplesByTextEndpoint.requiredScopes,
        {
          search,
          page,
          limit,
          vocabularyComplete,
        },
      );
      return response;
    },
    getExamplesByRecentlyModified: async (
      page: number,
      limit: number,
      vocabularyComplete?: boolean,
    ): Promise<ExampleTechnical[]> => {
      const response = await httpClient.post<ExampleTechnical[]>(
        getExamplesByMostRecentlyModifiedEndpoint.path,
        getExamplesByMostRecentlyModifiedEndpoint.requiredScopes,
        {
          page,
          limit,
          vocabularyComplete,
        },
      );
      return response;
    },
    createExamples: async (
      exampleCreates: CreateExamplesCommand,
    ): Promise<ExampleWithVocabulary[]> => {
      const response = await httpClient.post<ExampleWithVocabulary[]>(
        createExamplesEndpoint.path,
        createExamplesEndpoint.requiredScopes,
        {
          exampleCreates,
        },
      );
      return response;
    },
    updateExamples: async (
      exampleUpdates: UpdateExamplesCommand,
    ): Promise<ExampleWithVocabulary[]> => {
      const response = await httpClient.put<{
        examples: ExampleWithVocabulary[];
      }>(updateExamplesEndpoint.path, updateExamplesEndpoint.requiredScopes, {
        exampleUpdates,
      });
      return response.examples;
    },

    deleteExamples: async (exampleIds: number[]): Promise<number[]> => {
      const response = await httpClient.delete<{
        deletedExampleIds: number[];
      }>(deleteExamplesEndpoint.path, deleteExamplesEndpoint.requiredScopes, {
        params: {
          exampleIds: exampleIds.join(','),
        },
      });
      return response.deletedExampleIds;
    },
  };
}
