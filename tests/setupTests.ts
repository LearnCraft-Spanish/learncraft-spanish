import { server } from 'mocks/api/server';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import { setupMockAuth } from './setupMockAuth';
import '@testing-library/jest-dom';

// Mock the useAuth hook, but leave the mock return configurable per test
vi.mock('src/hooks/useAuth');

beforeEach(() => {
  setupMockAuth();
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
