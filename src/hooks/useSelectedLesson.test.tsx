import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import MockQueryClientProvider from "../../mocks/Providers/MockQueryClient";

import serverlikeData from "../../mocks/data/serverlike/serverlikeData";
import { getUserDataFromName } from "../../mocks/data/serverlike/studentTable";
import programsTable from "../../mocks/data/hooklike/programsTable";

import mockActiveStudentStub from "../../mocks/hooks/useActiveStudentStub";
import { useProgramTable } from "./useProgramTable";

import { useSelectedLesson } from "./useSelectedLesson";

const { api } = serverlikeData();

/*
This hook uses:
- useActiveStudent
- useProgramTable
*/

vi.mock("./useActiveStudent", vi.fn(() => {
  return {useActiveStudent: mockActiveStudentStub}
}));
vi.mock("./useProgramTable", vi.fn(() => {
  return {useProgramTable: () => ({
    programTableQuery: {
      data: programsTable,
      isSuccess: true
    }
  })}
}));


const studentAdmin = getUserDataFromName("student-admin");

describe("useSelectedLesson", () => {

  let programTableQuery: any;
  beforeEach(() => {
      // Setup for tests
    const { result } = renderHook(() => useProgramTable(), {wrapper: MockQueryClientProvider});
    waitFor(() => expect(result.current.programTableQuery.isSuccess).toBe(true));
    programTableQuery = result.current.programTableQuery;
  })

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
        programsTable[programsTable.length - 1].recordId;
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
      const newFromLesson = programTableQuery.data[0].lessons[0].recordId;
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
      const newToLesson = programTableQuery.data[0].lessons[1].recordId;
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
      const { result } = renderHook(() => useSelectedLesson(), {
        wrapper: MockQueryClientProvider,
      });
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      res = result
      if (!result.current.selectedProgram) {
        throw new Error("selectedProgram is null");
      }
      result.current.setFromLesson(
        result.current.selectedProgram.lessons[0].recordId
      );
      await waitFor(() => {
        expect(result.current.selectedFromLesson).not.toBeNull();
      });
    });

    it("allowedVocabulary is an array with length", () => {
      expect(res.current.allowedVocabulary.length).toBeGreaterThan(0);
    });
    it("requiredVocabulary is an array with length", () => {
      expect(res.current.requiredVocabulary.length).toBeDefined();
    });
    it("allowedVocabulary is a subset of requiredVocabulary", () => {
      expect(
        res.current.allowedVocabulary.every((word: any) =>
          res.current.requiredVocabulary.includes(word)
        )
      );
    });
  });
});
