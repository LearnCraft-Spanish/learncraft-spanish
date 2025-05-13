import type {
  CreateNonVerbVocabulary,
  CreateVerb,
  GetTotalCountResponse,
  ListVocabularyResponse,
  Vocabulary,
  VocabularyRelatedRecords,
} from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../../application/ports/authPort';
import type {
  VocabularyPort,
  VocabularyQueryOptions,
} from '../../application/ports/vocabularyPort';
import { VocabularyEndpoints } from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from '../http/client';

/**
 * Creates an implementation of the VocabularyPort.
 *
 * This function:
 * 1. Takes the auth provider from the outside world
 * 2. Creates the HTTP client with the provided auth
 * 3. Returns an implementation of the port
 *
 * @param apiUrl The base URL for API requests
 * @param auth The authentication token provider
 * @returns An implementation of the VocabularyPort
 */
export function createVocabularyInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): VocabularyPort {
  // Create an authenticated HTTP client
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  // Helper to build pagination parameters according to the contract
  const buildQueryParams = (
    options?: VocabularyQueryOptions,
  ): Record<string, string> => {
    if (!options) return {};

    const params: Record<string, string> = {};

    // Map our application options to the API's expected query parameters
    if (options.subcategoryId !== undefined) {
      params.subcategoryId = options.subcategoryId.toString();
    }

    // Convert our limit/offset to the API's page/limit pagination model
    if (options.limit !== undefined) {
      params.limit = options.limit.toString();
    }

    if (options.offset !== undefined) {
      // Convert offset to page number (approximation)
      const page = Math.floor(options.offset / (options.limit || 20)) + 1;
      params.page = page.toString();
    } else {
      params.page = '1'; // Default to page 1
    }

    return params;
  };

  return {
    getVocabulary: async (
      options?: VocabularyQueryOptions,
    ): Promise<Vocabulary[]> => {
      const queryParams = buildQueryParams(options);
      const response = await httpClient.get<ListVocabularyResponse>(
        VocabularyEndpoints.list.path,
        { params: queryParams },
      );

      // The API returns a paginated response, but our port expects an array
      // Extract items from the pagination wrapper
      return response.items;
    },

    getVocabularyCount: async (
      subcategoryId?: number,
    ): Promise<GetTotalCountResponse> => {
      // The backend expects query parameters in the format /api/vocabulary?subcategoryId=16
      const params: Record<string, string> = {};

      if (subcategoryId !== undefined) {
        params.subcategoryId = subcategoryId.toString();
      }

      // Use the list endpoint with the count parameter
      return httpClient.get<GetTotalCountResponse>(
        VocabularyEndpoints.getCount.path,
        { params },
      );
    },

    getVocabularyById: async (id: string): Promise<Vocabulary | null> => {
      const path = VocabularyEndpoints.getById.path.replace(':id', id);
      return httpClient.get<Vocabulary>(path);
    },

    createVerb: async (command: CreateVerb): Promise<Vocabulary> => {
      return httpClient.post<Vocabulary>(
        VocabularyEndpoints.createVerbVocabulary.path,
        command,
      );
    },

    createNonVerbVocabulary: async (
      command: CreateNonVerbVocabulary,
    ): Promise<Vocabulary> => {
      return httpClient.post<Vocabulary>(
        VocabularyEndpoints.createNonVerbVocabulary.path,
        command,
      );
    },

    createVocabularyBatch: async (
      commands: CreateNonVerbVocabulary[],
    ): Promise<Vocabulary[]> => {
      // If the API doesn't support batch operations, we can implement it client-side
      const results = await Promise.all(
        commands.map((command) =>
          httpClient.post<Vocabulary>(
            VocabularyEndpoints.createNonVerbVocabulary.path,
            command,
          ),
        ),
      );
      return results;
    },

    deleteVocabulary: async (id: string): Promise<number> => {
      const path = VocabularyEndpoints.delete.path.replace(':id', id);

      const result = await httpClient.delete<number>(path);

      return result;
    },

    getAllRecordsAssociatedWithVocabularyRecord: async (
      id: string | undefined,
    ): Promise<VocabularyRelatedRecords> => {
      if (!id) {
        return {
          vocabularyRecordId: 0,
          vocabularyExampleRecords: [],
          vocabularyLessonRecords: [],
          vocabularySpellingRecords: [],
        };
      }
      const path =
        VocabularyEndpoints.getAllRecordsAssociatedWithVocabularyRecord.path.replace(
          ':id',
          id,
        );
      return httpClient.get<VocabularyRelatedRecords>(path);
    },

    searchVocabulary: async (query: string): Promise<Vocabulary[]> => {
      // If the API doesn't have a dedicated search endpoint, use the list endpoint with a search param
      const response = await httpClient.get<ListVocabularyResponse>(
        VocabularyEndpoints.list.path,
        { params: { search: query } },
      );

      // Extract items from the pagination wrapper
      return response.items;
    },
  };
}
