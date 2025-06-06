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

  return {
    getSubcategories: async (): Promise<Subcategory[]> => {
      // Always use the endpoint from the shared package contract
      const response = await httpClient.get<Subcategory[]>(
        SubcategoryEndpoints.list.path,
      );

      return Array.isArray(response) ? response : [];
    },

    getSubcategoryById: async (id: string): Promise<Subcategory | null> => {
      // Use the getById endpoint directly from the shared package
      const path = SubcategoryEndpoints.getById.path.replace(':id', id);
      return httpClient.get<Subcategory>(path);
    },
  };
}
