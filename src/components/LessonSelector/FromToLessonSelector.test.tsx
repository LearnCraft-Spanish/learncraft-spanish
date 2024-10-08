import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, } from "vitest";
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import serverlikeData from "../../../mocks/data/serverlike/serverlikeData";
import FromToLessonSelector from "./FromToLessonSelector";
import { act } from "react";

interface WrapperProps {
  children: React.ReactNode;
}

const api = serverlikeData().api;
const studentAdmin = api.allStudentsTable.find(
  (student) => student.role === "student" && student.isAdmin === true,
);
if (!studentAdmin) throw new Error("No student admin found");

vi.unmock("./useUserData");
vi.mock("./useUserData", () => ({
  useUserData: vi.fn(() => ({
    isSuccess: true,
    data: studentAdmin,
  })),
}));

vi.mock('../../hooks/useActiveStudent', () => ({
  useActiveStudent: () => ({
    activeStudentQuery: { data: studentAdmin },
    activeProgram: { recordId: studentAdmin.relatedProgram },
    activeLesson: { recordId: 1 },
  }),
}));

describe("component FromToLessonSelector", () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('initial state', () => {
    beforeAll(async () => {
    });
      /*
      We must wait for From to be in the document, becuase
      we need to wait for the data to be loaded from useActiveStudent hook
      */
    it("label text for course, from, and to", async () => {
      render(<FromToLessonSelector />, { wrapper });
      await waitFor(() => expect(screen.getByText('From:')).toBeTruthy());
      // Tests
      expect(screen.getByText('Course:')).toBeTruthy();
      expect(screen.getByText('From:')).toBeTruthy();
      expect(screen.getByText('To:')).toBeTruthy();
    });
    it.skip("course dropdown has all programs", async () => {
      render(<FromToLessonSelector />, { wrapper });
      await waitFor(() => expect(screen.getByText('From:')).toBeTruthy());

      const programsNames = api.programsTable.map(program => program.name);
      // Tests
      for (const programName of programsNames) {
        expect(screen.getByText(programName)).toBeTruthy();
      }
    })
    it.skip("selected course is the related program of current user", async () => {
      render(<FromToLessonSelector />, { wrapper });
      await waitFor(() => expect(screen.getByText('From:')).toBeTruthy());

      const courseSelect = screen.getByLabelText('Course:');
      // Tests
      expect((courseSelect as HTMLSelectElement).value).toBe(studentAdmin.relatedProgram.toString());
    })
  })
});