import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import MockAllProviders from "../mocks/Providers/MockAllProviders";
import { setupMockAuth } from "../tests/setupMockAuth";
import App from "./App";

// Waiting for userData context to be finished
describe("app", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setupMockAuth();
  });

  it("renders without crashing", () => {
    setupMockAuth();
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
    console.log("Before Mock:", document.body.innerHTML); // Check DOM before cleanup
    setupMockAuth({ userName: "limited" });
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    console.log("On Render:", document.body.innerHTML); // Check DOM before cleanup
    await waitFor(() => {
      expect(getByText(/welcome/i)).toBeInTheDocument();
    });
  });

  it("shows official quizzes button", async () => {
    setupMockAuth({ userName: "limited" });
    const { getByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(getByText(/official quizzes/i)).toBeInTheDocument();
    });
  });

  it("displays logging in message", async () => {
    setupMockAuth({ isAuthenticated: false, isLoading: true });
    const { findAllByText } = render(
      <MockAllProviders>
        <App />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(findAllByText(/logging in.../i)).toBeInTheDocument();
    });
  });
});
