import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import React from "react";
import MockAllProviders from "../mocks/Providers/MockAllProviders";
import { setupMockAuth } from "../tests/setupMockAuth";

import FlashcardFinder from "./FlashcardFinder";

describe("flashcard finder", () => {
  it("renders without crashing", () => {
    render(
      <MockAllProviders>
        <FlashcardFinder contextual="" openContextual={() => vi.fn()} />
      </MockAllProviders>
    );
  });
});
