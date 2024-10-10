import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "../mocks/api/server";
import { getUserDataFromName } from "../mocks/data/serverlike/studentTable";

import "@testing-library/jest-dom";

import { createMockAuth } from "../mocks/hooks/useMockAuth";

// Create a shared mockAuth instance
const mockAuth = createMockAuth();

// Mock the useAuth hook globally
vi.mock("./useAuth", () => ({
  useAuth: () => mockAuth,
}));

/* For Specific Auth convigs use the following instead: */

/*
  import { createMockAuth } from './mockAuth';
  let mockAuth;

  beforeEach(() => {
    mockAuth = createMockAuth();
    vi.mocked(useAuth).mockReturnValue(mockAuth);
  });
*/

// Open the MSW server before all tests
beforeAll(() => {
  server.listen();
});

// Reset the mockAuth state before each test
beforeEach(() => {
  mockAuth.resetMocks(); // Ensure the mock is in default state
});

// Reset the server handlers after each test
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => server.close());
