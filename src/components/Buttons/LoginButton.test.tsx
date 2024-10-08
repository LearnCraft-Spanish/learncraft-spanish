import * as auth0 from "@auth0/auth0-react";
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import LoginButton from "./LoginButton";

vi.mock("@auth0/auth0-react");

describe("login button", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders without crashing", () => {
    (auth0 as any).useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      loginWithRedirect: vi.fn(),
    });
    render(<LoginButton />);
    expect(screen.getByText("Log in/Register")).toBeTruthy();
  });
  it("does not render when authenticated", () => {
    (auth0 as any).useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    render(<LoginButton />);
    expect(screen.queryByText("Log in/Register")).toBeNull();
  });
  it("calls loginWithRedirect when clicked", () => {
    const loginWithRedirect = vi.fn();
    (auth0 as any).useAuth0 = vi.fn().mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      loginWithRedirect,
    });
    render(<LoginButton />);
    screen.getByText("Log in/Register").click();
    expect(loginWithRedirect).toHaveBeenCalled();
  });
});
