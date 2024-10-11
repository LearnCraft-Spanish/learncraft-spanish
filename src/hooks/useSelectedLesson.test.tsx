import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import MockQueryClientProvider from "../../mocks/Providers/MockQueryClient";
import { getUserDataFromName } from "../../mocks/data/serverlike/studentTable";
import useActiveStudentStub from "../../mocks/hooks/useActiveStudentStub";
import { useSelectedLesson } from "./useSelectedLesson";

/*
This hook uses:
- useActiveStudent
- useProgramTable
*/

// for useActive Student, need useUserData with adminStudent

vi.mock("./useActiveStudent", useActiveStudent: () => useActiveStudentStub());

const studentAdmin = getUserDataFromName("student-admin");

describe("useSelectedLesson", () => {
  describe("initial state", () => {
    it("selectedProgram is userData's related program, selecteFromLesson null, selectedToLesson NOT null", async () => {
      const { result } = renderHook(() => useSelectedLesson(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      expect(result.current.selectedProgram?.recordId).toBe(
        studentAdmin?.relatedProgram
      );
      expect(result.current.selectedFromLesson).toBeNull();
      // This is calculated by activeLesson, in useActiveStudent
      expect(result.current.selectedToLesson?.recordId).toBeDefined();
    });
  });

  describe("setProgram", () => {
    it("sets the selected program", async () => {
      const { result } = renderHook(() => useSelectedLesson(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      const newProgram =
        api.programsTable[api.programsTable.length - 1].recordId;
      result.current.setProgram(newProgram);
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      expect(result.current.selectedProgram?.recordId).toBe(newProgram);
      // Make sure fromLesson is reset
      expect(result.current.selectedFromLesson).toBeNull();
      // should be active lesson
      expect(result.current.selectedToLesson?.recordId).toBeDefined();
    });
  });

  describe("setFromLesson", () => {
    it("sets the selected from lesson", async () => {
      const { result } = renderHook(() => useSelectedLesson(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      // check original value
      expect(result.current.selectedFromLesson).toBeNull();
      const newFromLesson = api.programsTable[0].lessons[0].recordId;
      result.current.setFromLesson(newFromLesson);
      await waitFor(() => {
        expect(result.current.selectedFromLesson).not.toBeNull();
      });
      expect(result.current.selectedFromLesson?.recordId).toBe(newFromLesson);
    });
  });

  describe("setToLesson", () => {
    it("sets the selected to lesson", async () => {
      const { result } = renderHook(() => useSelectedLesson(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      // check original value
      expect(result.current.selectedToLesson).not.toBeNull();
      const newToLesson = api.programsTable[0].lessons[0].recordId;
      result.current.setToLesson(newToLesson);
      await waitFor(() => {
        expect(result.current.selectedToLesson).not.toBeNull();
      });
      expect(result.current.selectedToLesson?.recordId).toBe(newToLesson);
    });
  });

  describe("filterExamplesBySelectedLesson", () => {
    it("filters the examples by the selected lesson", async () => {
      const { result } = renderHook(() => useSelectedLesson(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      const examples = api.verifiedExamplesTable;
      const filteredExamples =
        result.current.filterExamplesBySelectedLesson(examples);
      expect(filteredExamples.length).toBeLessThan(examples.length);
    });
  });

  describe("allowed & required Vocabulary", async () => {
    // set up the the tests
    let res: any;
    beforeAll(async () => {
      res = renderHook(() => useSelectedLesson(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() => {
        expect(res.result.current.selectedProgram).not.toBeNull();
      });
      res.result.current.setFromLesson(
        api.programsTable[0].lessons[1].recordId
      );
      await waitFor(() => {
        expect(res.result.current.selectedFromLesson).not.toBeNull();
      });
    });

    it("allowedVocabulary is an array with length", () => {
      expect(res.result.current.allowedVocabulary.length).toBeGreaterThan(0);
    });
    it("requiredVocabulary is an array with length", () => {
      expect(res.result.current.requiredVocabulary.length).toBeDefined();
    });
    it("allowedVocabulary is a subset of requiredVocabulary", () => {
      expect(
        res.result.current.allowedVocabulary.every((word: any) =>
          res.result.current.requiredVocabulary.includes(word)
        )
      );
    });
  });
});
