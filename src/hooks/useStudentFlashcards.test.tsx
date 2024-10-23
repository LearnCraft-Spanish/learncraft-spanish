import { renderHook, waitFor } from "@testing-library/react";

import { describe, expect, it } from "vitest";
import MockAllProviders from "../../mocks/Providers/MockAllProviders";
import { useStudentFlashcards } from "./useStudentFlashcards";

async function renderHookSuccessfully() {
  const { result } = renderHook(useStudentFlashcards, {
    wrapper: MockAllProviders,
  });

  await waitFor(() => {
    expect(result.current.flashcardDataQuery.isSuccess).toBeTruthy();
  });
  return {
    flashcardDataQuery: result.current.flashcardDataQuery,
    exampleIsCollected: result.current.exampleIsCollected,
    exampleIsPending: result.current.exampleIsPending,
    addFlashcardMutation: result.current.addFlashcardMutation,
    removeFlashcardMutation: result.current.removeFlashcardMutation,
    updateFlashcardMutation: result.current.updateFlashcardMutation,
  };
}

describe("useStudentFlashcards", () => {
  it("runs without crashing", async () => {
    const {
      flashcardDataQuery,
      exampleIsCollected,
      exampleIsPending,
      addFlashcardMutation,
      removeFlashcardMutation,
      updateFlashcardMutation,
    } = await renderHookSuccessfully();

    // assertions
    expect(flashcardDataQuery.isSuccess).toBeTruthy();
    expect(exampleIsCollected).toBeDefined();
    expect(exampleIsPending).toBeDefined();
    expect(addFlashcardMutation).toBeDefined();
    expect(removeFlashcardMutation).toBeDefined();
    expect(updateFlashcardMutation).toBeDefined();
  });
});
