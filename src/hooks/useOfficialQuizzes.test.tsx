import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { WrapperProps } from "../../src/interfaceDefinitions";

import mockData from "../../mocks/data/serverlike/serverlikeData";
import MockAllProviders from "../../mocks/Providers/MockAllProviders";
import { useOfficialQuizzes } from "./useOfficialQuizzes";

const { api } = mockData();
const quizzesTable = api.quizzesTable;
const quizExamplesTableArray = api.quizExamplesTableArray;

describe("useOfficialQuizzes", () => {
  const wrapper = ({ children }: WrapperProps) => (
    <MockAllProviders>{children}</MockAllProviders>
  );

  describe("officialQuizzesQuery", () => {
    it("runs without crashing", async () => {
      const { result } = renderHook(() => useOfficialQuizzes(undefined), {
        wrapper,
      });
      await waitFor(() =>
        expect(result.current.officialQuizzesQuery.isSuccess).toBe(true)
      );
      expect(result.current.officialQuizzesQuery.data).toBeDefined();
    });

    it("data length is mockDataLength", async () => {
      const { result } = renderHook(() => useOfficialQuizzes(undefined), {
        wrapper,
      });
      await waitFor(() =>
        expect(result.current.officialQuizzesQuery.data?.length).toBe(
          quizzesTable.length
        )
      );
    });
  });

  describe("quizExamplesQuery", () => {
    const randomQuizTable =
      quizExamplesTableArray[
        Math.floor(Math.random() * quizExamplesTableArray.length)
      ];
    const randomQuizNickname = randomQuizTable.quizNickname;
    const randomQuizId = quizzesTable.find(
      (quiz) => quiz.quizNickname === randomQuizNickname
    )?.recordId;
    it("runs without crashing", async () => {
      const { result } = renderHook(() => useOfficialQuizzes(randomQuizId), {
        wrapper,
      });
      await waitFor(() =>
        expect(result.current.quizExamplesQuery.isSuccess).toBe(true)
      );
      expect(result.current.quizExamplesQuery.data).toBeDefined();
    });

    it("data is mockData", async () => {
      const { result } = renderHook(() => useOfficialQuizzes(randomQuizId), {
        wrapper,
      });
      await waitFor(() =>
        expect(result.current.quizExamplesQuery.data).toEqual(
          randomQuizTable.quizExamplesTable
        )
      );
    });
  });
});
