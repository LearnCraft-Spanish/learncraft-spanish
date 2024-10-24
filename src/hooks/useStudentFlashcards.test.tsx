import { renderHook, waitFor } from "@testing-library/react";

import { beforeEach, describe, expect, it } from "vitest";
import MockAllProviders from "../../mocks/Providers/MockAllProviders";
import { allStudentsTable } from "../../mocks/data/serverlike/studentTable";
import { setupMockAuth } from "../../tests/setupMockAuth";

import type { mockUserNames } from "../interfaceDefinitions";

import { useStudentFlashcards } from "./useStudentFlashcards";

async function renderHookSuccessfully() {
  const { result } = renderHook(useStudentFlashcards, {
    wrapper: MockAllProviders,
  });
  await setTimeout(async () => {
    await waitFor(() => {
      expect(result.current.flashcardDataQuery.isSuccess).toBeFalsy();
    });
  }, 3000);
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

describe("test by role", () => {
  describe("user is student", () => {
    const studentUsers = allStudentsTable.filter(
      (student) => student.role === "student",
    );
    for (const student of studentUsers) {
      beforeEach(() => {
        setupMockAuth({ userName: student.name as mockUserNames });
      });
      it(`${student.name}: has flashcard data`, async () => {
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
        // Check for length
        expect(flashcardDataQuery.data?.examples.length).toBeGreaterThan(0);
      });
    }
  });
  describe("user is not student", () => {
    const nonStudentUsers = allStudentsTable.filter(
      (student) => student.role !== "student",
    );
    for (const student of nonStudentUsers) {
      beforeEach(() => {
        setupMockAuth({ userName: student.name as mockUserNames });
      });
      it(`${student.name}: flashcardDataQuery throws an error`, async () => {
        const { result } = renderHook(useStudentFlashcards, {
          wrapper: MockAllProviders,
        });
        await waitFor(() => {
          expect(result.current.flashcardDataQuery.isError).toBeTruthy();
        });
      });
    }
  });
});
