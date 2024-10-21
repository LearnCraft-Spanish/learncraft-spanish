import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, renderHook, screen, waitFor } from "@testing-library/react";

import MockAllProviders from "../mocks/Providers/MockAllProviders";
import { useStudentFlashcards } from "./hooks/useStudentFlashcards";
import FlashcardManager from "./FlashcardManager";

describe("component FlashcardManager", () => {
  // let flashcardDataQuery;
  // beforeEach(async () => {
  //   const { result } = renderHook(useStudentFlashcards, { wrapper: MockAllProviders });
  //   await waitFor(() => {expect(result.current.flashcardDataQuery.isSuccess).toBeTruthy();})
  //   flashcardDataQuery = result.current.flashcardDataQuery;
  // });
  it("renders", async () => {
    render(<FlashcardManager />, { wrapper: MockAllProviders });
    await waitFor(() => expect(screen.getByText("Flashcard Manager")).toBeInTheDocument());
    expect(screen.getByText("Flashcard Manager")).toBeInTheDocument();
  });
});


