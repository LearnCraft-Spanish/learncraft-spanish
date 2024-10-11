import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "../mocks/api/server";
import useAuth from "../src/hooks/useAuth";

import "@testing-library/jest-dom";

import createMockAuth from "../mocks/hooks/useMockAuth";

// Create a shared mockAuth instance
const globalMockAuth = createMockAuth();

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

// Reset the mockAuth state before each test
beforeEach(() => {
  globalMockAuth.resetMocks(); // Ensure the mock is in default state
});

// Reset the server handlers after each test
afterEach(() => {
  console.log("auth status after test:", globalMockAuth.isAuthenticated);
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => server.close());
