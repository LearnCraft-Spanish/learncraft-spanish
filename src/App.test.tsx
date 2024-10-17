import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import React from "react";
import MockAllProviders from "../mocks/Providers/MockAllProviders";
import { setupMockAuth } from "../tests/setupMockAuth";
import App from "./App";

// Waiting for userData context to be finished
describe("app", () => {
  afterEach(() => {
    vi.resetModules();
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
    setupMockAuth({ isAuthenticated: false });
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
    setupMockAuth({ isAuthenticated: false });
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

  it("shows welcome message", async () => {
    // const mockLimitedStudent = createMockAuth({ userName: "limited" });
    setupMockAuth({ userName: "limited" });
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByText(/welcome/i)).toBeInTheDocument();
    });
  });

  it("shows a loading spinner when logging in", async () => {
    setupMockAuth({ isLoading: true });
    const { getByAltText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByAltText("loading-spinner")).toBeInTheDocument();
    });
  });

  it("shows official quizzes button", async () => {
    setupMockAuth({
      userName: "limited",
      isAuthenticated: true,
      isLoading: false,
    });
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByText(/official quizzes/i)).toBeInTheDocument();
    });
  });

  it("displays my flashcards", async () => {
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByText(/quiz my flashcards/i)).toBeInTheDocument();
    });
  });
});
