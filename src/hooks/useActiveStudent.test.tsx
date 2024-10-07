import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import serverlikeData from "../../mocks/data/serverlike/serverlikeData";
import { useActiveStudent } from "./useActiveStudent";

const api = serverlikeData().api;

const studentAdmin = api.allStudentsTable.find(
  (student) => student.role === "student" && student.isAdmin === true,
);

interface WrapperProps {
  children: React.ReactNode;
}

vi.unmock("./useUserData");
vi.mock("./useUserData", () => ({
  useUserData: vi.fn(() => ({
    isSuccess: true,
    data: studentAdmin,
  })),
}));

describe("useActiveStudent", () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("runs without crashing", async () => {
    const { result } = renderHook(() => useActiveStudent(), { wrapper });
    await waitFor(() => {
      expect(result.current.activeStudentQuery.isSuccess).toBe(true);
    });
    expect(result.current.activeStudentQuery.data).toBeDefined();
  });
  describe("activeStudentQuery", () => {
    it("data is mocked useUserData", async () => {
      const { result } = renderHook(() => useActiveStudent(), { wrapper });
      await waitFor(() => {
        expect(result.current.activeStudentQuery.isSuccess).toBe(true);
      });
      expect(result.current.activeStudentQuery.data).toEqual(studentAdmin);
    });
  });

  describe("studentListQuery", () => {
    it("studentListQuery succeeds, data has length", async () => {
      const { result } = renderHook(() => useActiveStudent(), { wrapper });
      await waitFor(() => {
        expect(result.current.activeStudentQuery.isSuccess).toBe(true);
      });
      expect(result.current.studentListQuery.data?.length).toBeGreaterThan(0);
    });
  });

  describe("activeProgram", () => {
    it("activeProgram is same as userData realtedProgram", async () => {
      const { result } = renderHook(() => useActiveStudent(), { wrapper });
      await waitFor(() => {
        expect(result.current.activeStudentQuery.isSuccess).toBe(true);
      });

      expect(result.current.activeProgram?.recordId).toBe(
        studentAdmin?.relatedProgram,
      );
    });
  });

  describe("activeLesson", () => {
    it("activeLesson is not null", async () => {
      const { result } = renderHook(() => useActiveStudent(), { wrapper });
      await waitFor(() => {
        expect(result.current.activeStudentQuery.isSuccess).toBe(true);
      });
      expect(result.current.activeLesson?.recordId).toBeDefined();
    });
  });

  describe("chooseStudent function", () => {
    it("chooseStudent sets activeStudent", async () => {
      const { result } = renderHook(() => useActiveStudent(), { wrapper });
      await waitFor(() => {
        expect(result.current.studentListQuery.isSuccess).toBe(true);
      });
      // Choose a student that is not the current active student
      const student = result.current.studentListQuery.data?.find((student) => {
        return student.recordId !== studentAdmin?.recordId;
      });
      // update the active student
      if (student) {
        result.current.chooseStudent(student.recordId);
      }
      await waitFor(() => {
        expect(result.current.activeStudentQuery.isSuccess).toBe(true);
      });
      expect(result.current.activeStudentQuery.data).toEqual(student);
    });
  });
});
