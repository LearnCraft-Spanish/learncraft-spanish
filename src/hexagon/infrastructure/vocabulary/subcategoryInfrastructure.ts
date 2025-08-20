import type { AuthPort } from '@application/ports/authPort';
import type { SubcategoryPort } from '@application/ports/subcategoryPort';
import type { Subcategory } from '@learncraft-spanish/shared/src/domain/vocabulary/core-types';
import { createHttpClient } from '@infrastructure/http/client';
import { listSubcategoriesEndpoint } from '@learncraft-spanish/shared';

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
  const httpClient = createHttpClient(apiUrl, auth);

  return {
    getSubcategories: async (): Promise<Subcategory[]> => {
      // Always use the endpoint from the shared package contract
      const response = await httpClient.get<Subcategory[]>(
        listSubcategoriesEndpoint.path,
        listSubcategoriesEndpoint.requiredScopes,
      );

      return Array.isArray(response) ? response : [];
    },
  };
}
