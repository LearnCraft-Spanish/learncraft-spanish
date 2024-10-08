import * as auth0 from "@auth0/auth0-react";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import LogoutButton from "./LogoutButton";

vi.mock("@auth0/auth0-react");

describe("logout button", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });
  it("renders without crashing", () => {
    (auth0 as any).useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: true,
      logout: vi.fn(),
    });
    render(<LogoutButton />);
    expect(screen.getByText("Log Out")).toBeTruthy();
  });
  it("does not render when not authenticated", () => {
    (auth0 as any).useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: false,
    });
    render(<LogoutButton />);
    expect(screen.queryByText("Log Out")).toBeNull();
  });
  it("calls logout when clicked", () => {
    const logout = vi.fn();
    (auth0 as any).useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: true,
      logout,
    });
    render(<LogoutButton />);
    screen.getByText("Log Out").click();
    expect(logout).toHaveBeenCalled();
  });
});
