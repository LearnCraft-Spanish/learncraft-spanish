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
import { createHttpClient } from '@infrastructure/http/client';
import {
  createVocabularyEndpoint,
  deleteVocabularyEndpoint,
  getAllRecordsAssociatedWithVocabularyRecordEndpoint,
  getTotalCountEndpoint,
  getVocabularyByIdEndpoint,
  getVocabularyBySubcategoryEndpoint,
  getVocabularyCountBySubcategoryEndpoint,
  listVocabularyEndpoint,
} from '@LearnCraft-Spanish/shared';

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
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getVocabulary: async (): Promise<VocabularyAbbreviation[]> => {
      const response = await httpClient.get<ListVocabularyResponse>(
        listVocabularyEndpoint.path,
        listVocabularyEndpoint.requiredScopes,
      );

      // The API returns a paginated response, but our port expects an array
      // Extract items from the pagination wrapper
      return response;
    },

    getVocabularyBySubcategory: async (
      subcategoryId: number,
      page: number,
      limit: number,
    ): Promise<Vocabulary[]> => {
      const response = await httpClient.get<ListVocabularyFullResponse>(
        getVocabularyBySubcategoryEndpoint.path.replace(
          ':subcategoryId',
          subcategoryId.toString(),
        ),
        getVocabularyBySubcategoryEndpoint.requiredScopes,
        {
          params: {
            page: page.toString(),
            limit: limit.toString(),
          },
        },
      );

      return response;
    },

    getVocabularyCount: async (): Promise<number> => {
      // Use the list endpoint with the count parameter
      return httpClient.get<number>(
        getTotalCountEndpoint.path,
        getTotalCountEndpoint.requiredScopes,
      );
    },

    getVocabularyCountBySubcategory: async (
      subcategoryId: number,
    ): Promise<number> => {
      return httpClient.get<number>(
        getVocabularyCountBySubcategoryEndpoint.path.replace(
          ':subcategoryId',
          subcategoryId.toString(),
        ),
        getVocabularyCountBySubcategoryEndpoint.requiredScopes,
      );
    },

    getVocabularyById: async (id: number): Promise<Vocabulary | null> => {
      const path = getVocabularyByIdEndpoint.path.replace(':id', id.toString());
      return httpClient.get<Vocabulary>(
        path,
        getVocabularyByIdEndpoint.requiredScopes,
      );
    },

    createVocabulary: async (
      command: CreateVocabulary[],
    ): Promise<number[]> => {
      return httpClient.post<number[]>(
        createVocabularyEndpoint.path,
        createVocabularyEndpoint.requiredScopes,
        command,
      );
    },

    deleteVocabulary: async (ids: number[]): Promise<number> => {
      const result = await httpClient.delete<number>(
        deleteVocabularyEndpoint.path,
        deleteVocabularyEndpoint.requiredScopes,
        {
          data: ids,
        },
      );

      return result;
    },

    getRelatedRecords: async (
      id: number,
    ): Promise<VocabularyRelatedRecords> => {
      const path =
        getAllRecordsAssociatedWithVocabularyRecordEndpoint.path.replace(
          ':id',
          id.toString(),
        );
      return httpClient.get<VocabularyRelatedRecords>(
        path,
        getAllRecordsAssociatedWithVocabularyRecordEndpoint.requiredScopes,
      );
    },
  };
}
