import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import MockAllProviders from "../mocks/Providers/MockAllProviders";
import createMockAuth from "../mocks/hooks/useMockAuth";
import useAuth from "./hooks/useAuth";
import App from "./App";

// Waiting for userData context to be finished
describe("app", async () => {
  it("renders without crashing", async () => {
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
    const mockAuth = createMockAuth({ isAuthenticated: false });
    vi.mocked(useAuth).mockReturnValue(mockAuth);
    console.log(
      "mockAuth not logged in",
      mockAuth.isAuthenticated,
      mockAuth.isLoading,
      mockAuth.getAccessToken()
    );
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
    const mockAuth = createMockAuth({ isAuthenticated: false });
    vi.mocked(useAuth).mockReturnValue(mockAuth);
    console.log(
      "mockAuth not logged in",
      mockAuth.isAuthenticated,
      mockAuth.isLoading,
      mockAuth.getAccessToken()
    );
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByText(/you must be logged in/i)).toBeInTheDocument();
    });
  });

  it("shows welcome message", async () => {
    const mockAuth = createMockAuth({ userName: "limited" });
    vi.mocked(useAuth).mockReturnValue(mockAuth);
    console.log(
      "mockAuth limited",
      mockAuth.isAuthenticated,
      mockAuth.isLoading,
      mockAuth.getAccessToken()
    );
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByText(/welcome/i)).toBeInTheDocument();
    });
  });

  it("shows official quizzes button", async () => {
    vi.spyOn(useAuth, "default"); // Spy on the useAuth hook
    const mockAuth = createMockAuth({ userName: "limited" });
    vi.mocked(useAuth).mockReturnValue(mockAuth);
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
