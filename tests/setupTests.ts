import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { server } from '../mocks/api/server';

import '@testing-library/jest-dom';
import { setupMockAuth } from './setupMockAuth';

// Mock the useAuth hook, but leave the mock return configurable per test
vi.mock('../src/hooks/useAuth');

beforeEach(() => {
  setupMockAuth();
});

// Open the MSW server before all tests
beforeAll(() => {
  server.listen();
  Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: vi.fn(),
  });
});

// Reset the server handlers after each test
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => server.close());
