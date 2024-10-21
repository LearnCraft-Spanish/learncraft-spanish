import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";

import { getUserDataFromName } from "../../mocks/data/serverlike/studentTable";
import serverlikeData from "../../mocks/data/serverlike/serverlikeData";
import programsTable from "../../mocks/data/hooklike/programsTable";
import mockActiveStudentStub from "../../mocks/hooks/useActiveStudentStub";

import MockQueryClientProvider from "../../mocks/Providers/MockQueryClient";
import { setupMockAuth } from "../../tests/setupMockAuth";

// Types
import type { UserData } from "../interfaceDefinitions";

import { useSelectedLesson } from "./useSelectedLesson";

const { api } = serverlikeData();

vi.mock(
  "./useActiveStudent",
  vi.fn(() => {
    return {
      useActiveStudent: () =>
        mockActiveStudentStub({ studentName: "student-admin" }),
    };
  }),
);
vi.mock(
  "./useProgramTable",
  vi.fn(() => {
    return {
      useProgramTable: () => ({
        programTableQuery: {
          data: programsTable,
          isSuccess: true,
        },
      }),
    };
  }),
);

async function renderSelectedLesson() {
  const { result } = renderHook(() => useSelectedLesson(), {
    wrapper: MockQueryClientProvider,
  });
  await waitFor(() => expect(result.current.selectedProgram).not.toBeNull());
  return result;
}

describe("useSelectedLesson", () => {
  let student: UserData | null;

  beforeEach(() => {
    setupMockAuth({ userName: "student-admin" });
    student = getUserDataFromName("student-admin");
  });

  afterEach(() => {
    cleanup();
  });

  describe("initial state", () => {
    it("selectedProgram is userData's related program", async () => {
      const result = await renderSelectedLesson();
      expect(result.current.selectedProgram?.recordId).toBe(
        student?.relatedProgram,
      );
    });
    it("selectedFromLesson is first lesson in selectedProgram", async () => {
      const result = await renderSelectedLesson();
      expect(result.current.selectedFromLesson).toBe(
        result.current.selectedProgram?.lessons[0],
      );
    });
    it("selectedToLesson is NOT null", async () => {
      const result = await renderSelectedLesson();
      expect(result.current.selectedToLesson).not.toBeNull();
    });
  });

  describe("setProgram", () => {
    it("sets the selected program", async () => {
      const result = await renderSelectedLesson();
      const newProgram = programsTable[programsTable.length - 1].recordId;
      // newProgram is not the current program
      expect(result.current.selectedProgram?.recordId).not.toBe(newProgram);
      // Set new program
      act(() => result.current.setProgram(newProgram));
      await waitFor(() => {
        expect(result.current.selectedProgram).not.toBeNull();
      });
      expect(result.current.selectedProgram?.recordId).toBe(newProgram);
      // Make sure fromLesson is reset
      expect(result.current.selectedFromLesson?.recordId).toBe(
        programsTable[programsTable.length - 1].lessons[0].recordId,
      );
      // should be active lesson
      expect(result.current.selectedToLesson?.recordId).toBeDefined();
    });
  });

  describe("setFromLesson", () => {
    it("sets the selected from lesson", async () => {
      const result = await renderSelectedLesson();
      // check original value
      expect(result.current.selectedFromLesson).toBeDefined();
      const currentProgram = result.current.selectedProgram;
      if (!currentProgram) {
        throw new Error("currentProgram is null");
      }
      const newFromLesson = currentProgram?.lessons[1].recordId;
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
      const currentProgram = result.current.selectedProgram;
      if (!currentProgram) {
        throw new Error("currentProgram is null");
      }
      const newToLesson = currentProgram.lessons[1].recordId;
      result.current.setToLesson(newToLesson);
      await waitFor(() => {
        expect(result.current.selectedToLesson).not.toBeNull();
      });
      expect(result.current.selectedToLesson?.recordId).toBe(newToLesson);
    });
  });

  describe("filterExamplesBySelectedLesson", () => {
    it("filters the examples by the selected lesson", async () => {
      const result = await renderSelectedLesson();
      // set to lesson
      const program = result.current.selectedProgram;
      const newToLesson = program?.lessons[4].recordId;
      if (!newToLesson) {
        throw new Error("newFromLesson is null");
      }
      act(() => {
        result.current.setToLesson(newToLesson);
      });
      await waitFor(() => {
        expect(result.current.selectedFromLesson).not.toBeNull();
      });

      const examples = api.verifiedExamplesTable;
      const filteredExamples =
        result.current.filterExamplesBySelectedLesson(examples);
      expect(filteredExamples.length).toBeLessThan(examples.length);
      expect(filteredExamples.length).toBeGreaterThan(0);
    });
    it("returns an empty array if no vocabulary is learned between fromLesson & toLesson, inclusive", async () => {
      const result = await renderSelectedLesson();
      // set to & from lesson to the same lesson, with no vocabIncluded
      const program = result.current.selectedProgram;
      const lessonWithoutVocab = program?.lessons.find(
        (lesson) => lesson.vocabIncluded.length === 0,
      );
      if (!lessonWithoutVocab) {
        throw new Error("lessonWithoutVocab is null");
      }
      act(() => {
        result.current.setToLesson(lessonWithoutVocab.recordId);
        result.current.setFromLesson(lessonWithoutVocab.recordId);
      });
      await waitFor(() => {
        expect(result.current.selectedToLesson?.recordId).toBe(
          lessonWithoutVocab.recordId,
        );
      });
      if (
        result.current.selectedToLesson?.vocabIncluded.length ||
        result.current.selectedFromLesson?.vocabIncluded.length
      ) {
        throw new Error("Bad data provided: VocabIncluded is not null");
      }
      const examples = api.verifiedExamplesTable;
      const filteredExamples =
        result.current.filterExamplesBySelectedLesson(examples);
      expect(filteredExamples.length).toBe(0);
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
      res = result;
      if (!result.current.selectedProgram) {
        throw new Error("selectedProgram is null");
      }
      result.current.setFromLesson(
        result.current.selectedProgram.lessons[0].recordId,
      );
      await waitFor(() => {
        expect(result.current.selectedFromLesson).not.toBeNull();
      });
    });

    it("allowedVocabulary is an array with length", () => {
      expect(res.current.allowedVocabulary.length).toBeDefined();
    });
    it("requiredVocabulary is an array with length", () => {
      expect(res.current.requiredVocabulary.length).toBeDefined();
    });
    it("allowedVocabulary is a subset of requiredVocabulary", () => {
      expect(
        res.current.allowedVocabulary.every((word: any) =>
          res.current.requiredVocabulary.includes(word),
        ),
      );
    });
  });
});
