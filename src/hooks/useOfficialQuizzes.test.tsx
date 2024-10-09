import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import mockData from "../../mocks/data/serverlike/serverlikeData";
import { useOfficialQuizzes } from "./useOfficialQuizzes";

interface WrapperProps {
  children: React.ReactNode;
}

const { api } = mockData();
const quizzesTable = api.quizzesTable;
const quizExamplesTableArray = api.quizExamplesTableArray;

describe("useOfficialQuizzes", () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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
