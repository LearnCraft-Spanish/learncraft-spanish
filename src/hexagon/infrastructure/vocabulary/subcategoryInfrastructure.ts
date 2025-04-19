import type { Subcategory } from '@LearnCraft-Spanish/shared/src/domain/vocabulary/core-types';
import type { AuthPort } from '../../application/ports/authPort';
import type { SubcategoryPort } from '../../application/ports/subcategoryPort';
import { createAuthenticatedHttpClient } from '../http/client';

// Default API endpoints
const SUBCATEGORIES_ENDPOINT = '/subcategories';

/**
 * Creates an implementation of the SubcategoryPort.
 *
 * This function:
 * 1. Takes the auth provider from the outside world
 * 2. Creates the HTTP client with the provided auth
 * 3. Returns an implementation of the port
 *
 * @param apiUrl The base URL for API requests
 * @param auth The authentication token provider
 * @returns An implementation of the SubcategoryPort
 */
export function createSubcategoryInfrastructure(
  apiUrl: string,
  auth: AuthPort,
): SubcategoryPort {
  // Create an authenticated HTTP client
  const httpClient = createAuthenticatedHttpClient(apiUrl, auth);

  return {
    getSubcategories: async (): Promise<Subcategory[]> => {
      return httpClient.get<Subcategory[]>(SUBCATEGORIES_ENDPOINT);
    },

    getSubcategoryById: async (id: string): Promise<Subcategory | null> => {
      return await httpClient.get<Subcategory>(
        `${SUBCATEGORIES_ENDPOINT}/${id}`,
      );
    },
  };
}
