import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MockAllProviders from "../mocks/Providers/MockAllProviders";
import NotFoundPage from "./NotFoundPage";

describe("not found page", () => {
  it("shows 404 message", async () => {
    render(
      <MockAllProviders route="/anythingrandom">
        <NotFoundPage />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(screen.getByText(/404: Page Not Found/i)).toBeInTheDocument();
    });
  });
  it("shows menu button", async () => {
    render(
      <MockAllProviders route="/anythingRandom">
        <NotFoundPage />
      </MockAllProviders>
    );
    await waitFor(() => {
      expect(screen.getByText(/back to menu/i)).toBeInTheDocument();
    });
  });
});
