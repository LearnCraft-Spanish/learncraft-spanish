import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import MockAllProviders from "../mocks/Providers/MockAllProviders";
import createMockAuth from "../mocks/hooks/useMockAuth";
import useAuth from "./hooks/useAuth";
import App from "./App";

// Waiting for userData context to be finished
describe("app", () => {
  let mockAuth = null;
  afterEach(() => {
    cleanup();
  });
  it("renders without crashing", () => {
    render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
  });

  it("shows a log out button when logged in", async () => {
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByText(/log out/i)).toBeInTheDocument();
    });
  });

  it("shows a log in button when logged out", async () => {
    mockAuth = createMockAuth({ isAuthenticated: false });
    vi.mocked(useAuth).mockReturnValue(mockAuth);
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByText(/log in/i)).toBeInTheDocument();
    });
  });

  it("says it won't do anything if not logged in", async () => {
    mockAuth = createMockAuth({ isAuthenticated: false });
    vi.mocked(useAuth).mockReturnValue(mockAuth);
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(
        getByText("You must be logged in to use this app.")
      ).toBeInTheDocument();
    });
  });

  describe("limited student", () => {
    beforeEach(() => {
      const mockLimitedStudent = createMockAuth({ userName: "limited" });
      // vi.mocked(useAuth).mockReturnValue(mockLimitedStudent);
      // re import app to get the new useAuth
      vi.resetModules();
      vi.doUnmock("./hooks/useAuth");
      vi.doMock("./hooks/useAuth", () => {
        return {
          default: vi.fn(() => mockLimitedStudent),
        };
      });
    });
    afterEach(() => {
      vi.clearAllMocks();
    });

    it("shows welcome message", async () => {
      // const mockLimitedStudent = createMockAuth({ userName: "limited" });
      // mockAuth = createMockAuth({ userName: "limited" });
      // vi.mocked(useAuth).mockReturnValue(mockLimitedStudent);
      const { getByText } = render(
        <MockAllProviders>
          <App />
        </MockAllProviders>
      );
      await waitFor(() => {
        expect(getByText(/welcome/i)).toBeInTheDocument();
      });
    });
  });

  it("shows official quizzes button", async () => {
    mockAuth = createMockAuth({
      userName: "limited",
      isAuthenticated: true,
      isLoading: false,
    });
    vi.mocked(useAuth).mockRejectedValue(new Error("error"));
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByText(/official quizzes/i)).toBeInTheDocument();
    });
  });

  it("displays an error", async () => {
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByText(/error/i)).toBeInTheDocument();
    });
  });
});
