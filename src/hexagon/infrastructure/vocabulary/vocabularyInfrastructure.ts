import type { AuthPort } from '@application/ports/authPort';
import type { VocabularyPort } from '@application/ports/vocabularyPort';
import type {
  CreateVocabulary,
  ListVocabularyFullResponse,
  ListVocabularyResponse,
  Vocabulary,
  VocabularyAbbreviation,
  VocabularyRelatedRecords,
} from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from '@infrastructure/http/client';
import { VocabularyEndpoints } from '@LearnCraft-Spanish/shared';

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
        {
          params: { query: { page: page.toString(), limit: limit.toString() } },
        },
      );

      return response.items;
    },

    getVocabularyCount: async (): Promise<number> => {
      // Use the list endpoint with the count parameter
      return httpClient.get<number>(VocabularyEndpoints.getTotalCount.path);
    },

    getVocabularyCountBySubcategory: async (
      subcategoryId: number,
    ): Promise<number> => {
      return httpClient.get<number>(
        VocabularyEndpoints.getCountBySubcategory.path.replace(
          ':subcategoryId',
          subcategoryId.toString(),
        ),
      );
    },

    getVocabularyById: async (id: number): Promise<Vocabulary | null> => {
      const path = VocabularyEndpoints.getById.path.replace(
        ':id',
        id.toString(),
      );
      return httpClient.get<Vocabulary>(path);
    },

    createVocabulary: async (command: CreateVocabulary): Promise<number> => {
      return httpClient.post<number>(VocabularyEndpoints.create.path, command);
    },

    deleteVocabulary: async (id: number): Promise<number> => {
      const path = VocabularyEndpoints.delete.path.replace(
        ':id',
        id.toString(),
      );

      const result = await httpClient.delete<number>(path);

      return result;
    },

    getRelatedRecords: async (
      id: number,
    ): Promise<VocabularyRelatedRecords[]> => {
      const path = VocabularyEndpoints.getAssociatedRecords.path.replace(
        ':id',
        id.toString(),
      );
      return httpClient.get<VocabularyRelatedRecords[]>(path);
    },
  };
}
