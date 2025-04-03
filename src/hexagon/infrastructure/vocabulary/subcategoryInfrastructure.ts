import type { Subcategory } from '@Learncraft-spanish/shared/src/domain/vocabulary/core-types';
import { createHttpClient } from '../http/client';

// TODO: Fix import when shared package paths are resolved
// Direct import from source path for consistency with other imports
// import { listSubcategoriesEndpoint } from '@Learncraft-spanish/shared/src/contracts/vocabulary/endpoints/subcategory';

// Mock endpoint until we resolve the import issues
const listSubcategoriesEndpoint = {
  path: '/api/vocabulary/subcategories',
  method: 'GET',
};

// Create an HTTP client instance for vocabulary API
// Default to localhost during development
const apiBaseUrl = 'http://localhost:3001';
const httpClient = createHttpClient(apiBaseUrl);

/**
 * Infrastructure implementation for subcategory operations.
 * Uses the HTTP client to connect to APIs using the contracts from the shared package.
 */
export const subcategoryInfrastructure = {
  getSubcategories: async (): Promise<Subcategory[]> => {
    try {
      // Use the HTTP client with the endpoint
      return httpClient.get<Subcategory[]>(listSubcategoriesEndpoint.path);
    } catch (error) {
      console.error('Error fetching subcategories:', error);

      // Fallback to mock data if the API call fails
      // Note: Using fallback mock data until API connection is stable
      return [
        { id: 'noun-subcategory', name: 'Nouns', type: 'Common' },
        {
          id: 'adjective-subcategory',
          name: 'Adjectives',
          type: 'Descriptive',
        },
        { id: 'verb-subcategory', name: 'Verbs', type: 'Action' },
      ];
    }
  },

  getSubcategoryById: async (id: string): Promise<Subcategory | null> => {
    try {
      const subcategories = await subcategoryInfrastructure.getSubcategories();
      return subcategories.find((subcategory) => subcategory.id === id) || null;
    } catch (error) {
      console.error(`Error fetching subcategory with ID ${id}:`, error);
      throw error;
    }
  },
};
