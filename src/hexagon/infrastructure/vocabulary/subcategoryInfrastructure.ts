import type { Subcategory } from '@LearnCraft-Spanish/shared/src/domain/vocabulary/core-types';
import type { AuthPort } from '../../application/ports/authPort';
import type { SubcategoryPort } from '../../application/ports/subcategoryPort';
import { SubcategoryEndpoints } from '@LearnCraft-Spanish/shared';
import { createAuthenticatedHttpClient } from '../http/client';

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

  // Define paths based on API contract
  const SUBCATEGORIES_ENDPOINT = '/api/subcategories';
  const getSubcategoryPath = (id: string) => `/api/subcategories/${id}`;

  return {
    getSubcategories: async (): Promise<Subcategory[]> => {
      // Use the subcategories list endpoint
      // If SubcategoryEndpoints.list exists, use it instead
      const endpoint =
        SubcategoryEndpoints.list?.path || SUBCATEGORIES_ENDPOINT;

      const response = await httpClient.get<{ items: Subcategory[] }>(endpoint);

      // The API returns a paginated response, but our port expects an array
      return response.items;
    },

    getSubcategoryById: async (id: string): Promise<Subcategory | null> => {
      // Construct path directly since the endpoint might not be defined in shared
      const path = getSubcategoryPath(id);
      return httpClient.get<Subcategory>(path);
    },
  };
}
