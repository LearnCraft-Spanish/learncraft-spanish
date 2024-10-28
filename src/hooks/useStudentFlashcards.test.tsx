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
  describe("removeFlashcardMutation", () => {
    beforeEach(() => {
      setupMockAuth({ userName: "student-lcsp" });
    });
    it("removes a flashcard successfully", async () => {
      const { result } = renderHook(useStudentFlashcards, {
        wrapper: MockAllProviders,
      });
      await waitFor(() => {
        expect(result.current.flashcardDataQuery.isSuccess).toBeTruthy();
      });
      const flashcardDataQuery = result.current.flashcardDataQuery;
      const removeFlashcardMutation = result.current.removeFlashcardMutation;

      const initalLength = flashcardDataQuery.data?.studentExamples.length;
      if (!initalLength) throw new Error("No flashcards to remove");
      // assertions
      expect(flashcardDataQuery.isSuccess).toBeTruthy();
      expect(removeFlashcardMutation).toBeDefined();
      // Remove a flashcard
      const flashcardToRemove = flashcardDataQuery.data?.examples[0];
      if (!flashcardToRemove) throw new Error("No flashcard to remove");

      removeFlashcardMutation.mutate(flashcardToRemove.recordId);
      await waitFor(() => {
        // must reference result directly, as the hook is re-rendered
        expect(
          result.current.flashcardDataQuery.data?.examples.length,
        ).toBeLessThan(initalLength);
      });
    });
    it("throws error when removing a flashcard that does not exist", async () => {
      const { result } = renderHook(useStudentFlashcards, {
        wrapper: MockAllProviders,
      });
      await waitFor(() => {
        expect(result.current.flashcardDataQuery.isSuccess).toBeTruthy();
        expect(result.current.removeFlashcardMutation).toBeDefined();
      });
      const initalLength =
        result.current.flashcardDataQuery.data?.studentExamples.length;
      if (!initalLength) throw new Error("No flashcards to remove");

      // attempt to remove a fake flashcard
      result.current.removeFlashcardMutation.mutate(-1);

      await waitFor(() => {
        expect(result.current.removeFlashcardMutation.isError).toBeTruthy();
        expect(result.current.flashcardDataQuery.data?.examples.length).toBe(
          initalLength,
        );
      });
    });
  });
});
