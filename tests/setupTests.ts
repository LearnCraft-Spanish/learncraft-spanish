import { server } from 'mocks/api/server';
import { callMockSubcategoryAdapter } from 'src/hexagon/application/adapters/subcategoryAdapter.mock';

import { callMockVocabularyAdapter } from 'src/hexagon/application/adapters/vocabularyAdapter.mock';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { setupMockAuth } from './setupMockAuth';
import '@testing-library/jest-dom';

// We no longer import hexagonal mocks globally to avoid conflicts
// Each test that needs hexagonal mocks should import them directly:
// import { setupHexagonalMocks } from 'src/hexagon/testing';

// Mock the useAuth hook, but leave the mock return configurable per test
vi.mock('src/hooks/useAuth');

const setupAdapterMocks = () => {
  vi.mock('@application/adapters/vocabularyAdapter', () => ({
    useVocabularyAdapter: callMockVocabularyAdapter,
  }));

  vi.mock('@application/adapters/subcategoryAdapter', () => ({
    useSubcategoryAdapter: callMockSubcategoryAdapter,
  }));
};

beforeEach(() => {
  setupMockAuth();
  setupAdapterMocks();
});

// Open the MSW server before all tests
beforeAll(() => {
  server.listen();
});

// Reset the server handlers after each test
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => server.close());
