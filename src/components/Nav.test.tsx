import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import Nav from "./Nav";

describe("component Nav", () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });
  it("renders without crashing", () => {
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>,
    );
    expect(screen.getByAltText("Learncraft Spanish Logo")).toBeTruthy();
  });
});
