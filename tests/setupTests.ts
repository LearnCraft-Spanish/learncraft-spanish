import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "../mocks/api/server";
import "@testing-library/jest-dom";

// Mock the useAuth hook, but leave the mock return configurable per test
vi.mock("../src/hooks/useAuth");

// Open MSW server before all tests
beforeAll(() => {
  server.listen();
});

// Reset the server handlers and clear mocks after each test
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks(); // Clears mock state after each test
  vi.restoreAllMocks(); // Restores all mocks to their initial state
  cleanup(); // Ensures test DOM is cleaned up
});

// Close the MSW server after all tests
afterAll(() => server.close());
