import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import MockAllProviders from "../../mocks/Providers/MockAllProviders";
import { setupMockAuth } from "../../tests/setupMockAuth";
import Nav from "./Nav";

describe("component Nav", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });
  it("renders the logo", () => {
    render(
      <MockAllProviders>
        <Nav />
      </MockAllProviders>
    );
    expect(screen.getByAltText("Learncraft Spanish Logo")).toBeInTheDocument();
  });

  it("shows login button when user is not logged in", () => {
    setupMockAuth({ isAuthenticated: false });
    render(
      <MockAllProviders>
        <Nav />
      </MockAllProviders>
    );
    expect(screen.getByText(/log in\/register/i)).toBeInTheDocument();
  });

  it("shows logout button when user is logged in", () => {
    render(
      <MockAllProviders>
        <Nav />
      </MockAllProviders>
    );
    expect(screen.getByText(/log out/i)).toBeInTheDocument();
  });
});
