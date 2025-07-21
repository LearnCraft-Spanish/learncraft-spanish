import {
  mockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import { server } from 'mocks/api/server';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// We no longer import hexagonal mocks globally to avoid conflicts
// Each test that needs hexagonal mocks should import them directly:
// import { setupHexagonalMocks } from 'src/hexagon/testing';

// Mock the useAuth hook, but leave the mock return configurable per test
vi.mock('@application/adapters/authAdapter', () => ({
  useAuthAdapter: vi.fn(() => mockAuthAdapter),
}));

beforeEach(() => {
  resetMockAuthAdapter();
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
