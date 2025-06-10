import type {
  CreateVocabulary,
  GetTotalCountResponse,
  ListVocabularyFullResponse,
  ListVocabularyResponse,
  Vocabulary,
  VocabularyAbbreviation,
  VocabularyRelatedRecords,
} from '@LearnCraft-Spanish/shared';
import type { AuthPort } from '../../application/ports/authPort';
import type { VocabularyPort } from '../../application/ports/vocabularyPort';
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

  return {
    getVocabulary: async (): Promise<VocabularyAbbreviation[]> => {
      const response = await httpClient.get<ListVocabularyResponse>(
        VocabularyEndpoints.listAll.path,
      );

      // The API returns a paginated response, but our port expects an array
      // Extract items from the pagination wrapper
      return response.items;
    },

    getVocabularyBySubcategory: async (
      subcategoryId: number,
      page: number,
      limit: number,
    ): Promise<Vocabulary[]> => {
      const response = await httpClient.get<ListVocabularyFullResponse>(
        VocabularyEndpoints.listBySubcategory.path.replace(
          ':subcategoryId',
          subcategoryId.toString(),
        ),
        { params: { query: { page: page.toString(), limit: limit.toString() } } },
      );

      return response.items;
    },

    getVocabularyCount: async (): Promise<number> => {
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

    createVerb: async (command: CreateVocabulary): Promise<Vocabulary> => {
      return httpClient.post<Vocabulary>(
        VocabularyEndpoints.create.path,
        command,
      );
    },

    deleteVocabulary: async (id: string): Promise<number> => {
      const path = VocabularyEndpoints.delete.path.replace(':id', id);

      const result = await httpClient.delete<number>(path);

      return result;
    },

    getAllRecordsAssociatedWithVocabularyRecord: async (
      id: string | undefined,
    ): Promise<VocabularyRelatedRecords> =>
      const path =
        VocabularyEndpoints.getAssociatedRecords.path.replace(
          ':id',
          id,
        );
      return httpClient.get<VocabularyRelatedRecords>(path);
    },

    searchVocabulary: async (
      subcategoryId: string,
    ): Promise<VocabularyAbbreviation[]> => {
      // If the API doesn't have a dedicated search endpoint, use the list endpoint with a search param
      const response = await httpClient.get<ListVocabularyResponse>(
        VocabularyEndpoints.listBySubcategory.path.replace(
          ':subcategoryId',
          subcategoryId,
        ),
      );

      // Extract items from the pagination wrapper
      return response.items;
    },
  };
}
