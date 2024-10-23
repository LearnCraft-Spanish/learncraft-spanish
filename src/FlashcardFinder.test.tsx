import { describe, it, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import MockAllProviders from "../mocks/Providers/MockAllProviders";

import FlashcardFinder from "./FlashcardFinder";

describe("flashcard finder", () => {
  it("renders without crashing", () => {
    render(
      <MockAllProviders>
        <FlashcardFinder contextual="" openContextual={() => vi.fn()} />
      </MockAllProviders>,
    );
  });
});
