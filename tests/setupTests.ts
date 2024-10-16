import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "../mocks/api/server";

import "@testing-library/jest-dom";

import createMockAuth from "../mocks/hooks/useMockAuth";
import useAuth from "../src/hooks/useAuth";

// Create a shared mockAuth instance
export const globalMockAuth = createMockAuth();

// Mock the default export of the useAuth hook
vi.mock("../src/hooks/useAuth", () => {
  return {
    default: vi.fn(() => globalMockAuth),
  };
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