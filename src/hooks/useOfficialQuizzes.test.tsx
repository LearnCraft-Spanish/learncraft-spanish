import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import data from "../../mocks/data/serverlike/mockBackendData.json";
import quizExamples from "../../mocks/data/serverlike/mockQuizExamplesTable.json";
import { useOfficialQuizzes } from "./useOfficialQuizzes";

interface WrapperProps {
  children: React.ReactNode;
}

vi.mock("./useBackend", () => ({
  useBackend: vi.fn(() => ({
    getLcspQuizzesFromBackend: vi.fn(() => data.api.quizzesTable),
    getQuizExamplesFromBackend: vi.fn(
      (recordId: number) => quizExamples[recordId.toString()],
    ),
  })),
}));

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
        expect(result.current.officialQuizzesQuery.isSuccess).toBe(true),
      );
      expect(result.current.officialQuizzesQuery.data).toBeDefined();
    });

    it("data length is mockDataLength", async () => {
      const { result } = renderHook(() => useOfficialQuizzes(undefined), {
        wrapper,
      });
      await waitFor(() =>
        expect(result.current.officialQuizzesQuery.data?.length).toBe(
          data.api.quizzesTable.length,
        ),
      );
    });
  });

  describe("quizExamplesQuery", () => {
    // 127 becuase I know recordId 127 is in our quizExamples mock data
    const recordId = 127;
    it("runs without crashing", async () => {
      const { result } = renderHook(() => useOfficialQuizzes(recordId), {
        wrapper,
      });
      await waitFor(() =>
        expect(result.current.quizExamplesQuery.isSuccess).toBe(true),
      );
      expect(result.current.quizExamplesQuery.data).toBeDefined();
    });

    it("data is mockData", async () => {
      const { result } = renderHook(() => useOfficialQuizzes(recordId), {
        wrapper,
      });
      await waitFor(() =>
        expect(result.current.quizExamplesQuery.data).toEqual(
          quizExamples[recordId.toString()],
        ),
      );
    });
  });
});
