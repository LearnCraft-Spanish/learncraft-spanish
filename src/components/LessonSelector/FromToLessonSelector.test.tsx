import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import serverlikeData from "../../../mocks/data/serverlike/serverlikeData";
import { useProgramTable } from "../../hooks/useProgramTable";
import { useSelectedLesson } from "../../hooks/useSelectedLesson";

import FromToLessonSelector from "./FromToLessonSelector";

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

/*
Cases we should test for:
*** Missing Tests ***
- from selector lesson# is never higher than to selector lesson#
- When course is selected, from selector has all lessons of that course



*** Current Tests ***
- Initial State
  - Label text for course, to, and from exist (data has loaded from hooks)
  - Course dropdown has all programs
  - Selected course is the related program of current user
*/
describe("component FromToLessonSelector", () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(async () => {
    /*
    We must waitFor "From:" to be in the document, becuase
    we need to wait for the data to be loaded from useActiveStudent hook
    */
    render(<FromToLessonSelector />, { wrapper });
    await waitFor(() => expect(screen.getByText('From:')).toBeInTheDocument());
  })

  describe('initial state', () => {
    it("label text for course, to, and from exist", async () => {

      // Tests
      expect(screen.getByText('Course:')).toBeInTheDocument();
      expect(screen.getByText('From:')).toBeInTheDocument();
      expect(screen.getByText('To:')).toBeInTheDocument();
    });
    it("course dropdown has all programs", async () => {
      const { result } = renderHook(() => useProgramTable(), { wrapper });
      await waitFor(() => {
        expect(result.current.programTableQuery.isSuccess).toBe(true);
      });
      const programsNames = result.current.programTableQuery.data?.map(program => program.name);
      if (!programsNames) throw new Error("No programs found");
      // Tests
      for (const programName of programsNames) {
        expect(screen.getByText(programName)).toBeInTheDocument();
      }
    })
    it("selected course is the related program of current user", async () => {
      const courseSelect = screen.getByLabelText('Course:');
      // Tests
      expect((courseSelect as HTMLSelectElement).value).toBe(studentAdmin.relatedProgram.toString());
    })
  })

  it('when course is "-Choose Course-" (value = 0), from and to selectors are not displayed', async () => {
    const result = renderHook(() => useSelectedLesson(), { wrapper });
    await waitFor(() => {
      expect(result.result.current.selectedProgram).not.toBeNull();
    });
    result.result.current.setProgram(0);

    const courseSelect = screen.getByLabelText('Course:');
    // fireEvent.change(courseSelect, { target: { value: '0' } });
    await waitFor(() => expect((courseSelect as HTMLSelectElement).value).toBe('0'));

    // Tests
    const fromSelect = screen.queryByText('From:');
    expect(fromSelect).not.toBeInTheDocument();
  })
});