import { overrideMockOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter.mock';

import { overrideMockActiveStudent } from '@application/coordinators/hooks/useActiveStudent.mock';
import {
  mockSelectedCourseAndLessons,
  overrideMockSelectedCourseAndLessons,
} from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import {
  getCourseCodeFromName,
  useOfficialQuizSetupMenu,
} from '@application/units/OfficialQuiz/useOfficialQuizSetupMenu';
import { officialQuizCourses } from '@learncraft-spanish/shared';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockOfficialQuizRecord } from '@testing/factories/quizFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('useOfficialQuizSetupMenu', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    overrideMockOfficialQuizAdapter({
      getOfficialQuizRecords: async () => [
        createMockOfficialQuizRecord({
          id: 1,
          courseCode: 'lcsp',
          quizNumber: 1,
          quizTitle: 'LCSP 1',
        }),
        createMockOfficialQuizRecord({
          id: 2,
          courseCode: 'si1m',
          quizNumber: 1,
          quizTitle: 'SI1M 1',
        }),
      ],
    });
    overrideMockSelectedCourseAndLessons({
      course: { id: 1, name: 'LearnCraft Spanish' } as any,
      toLesson: { lessonNumber: 1 } as any,
      isLoading: false,
    });
    overrideMockActiveStudent({
      appUser: { studentRole: 'student', lessonNumber: 1 } as any,
    });
  });

  it('prefills course and quiz number, filters quizOptions', async () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <TestQueryClientProvider>{children}</TestQueryClientProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useOfficialQuizSetupMenu(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.courseCode).toBe('lcsp'));
    await waitFor(() => expect(result.current.quizNumber).toBe(1));
    await waitFor(() =>
      expect(result.current.quizOptions.map((q) => q.courseCode)).toEqual([
        'lcsp',
      ]),
    );
  });

  describe('startQuiz function', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <TestQueryClientProvider>{children}</TestQueryClientProvider>
      </MemoryRouter>
    );

    it('navigates to correct URL when course and quiz number are set', async () => {
      const { result } = renderHook(() => useOfficialQuizSetupMenu(), {
        wrapper: Wrapper,
      });

      // Wait for initial state to be set
      await waitFor(() => expect(result.current.courseCode).toBe('lcsp'));
      await waitFor(() => expect(result.current.quizNumber).toBe(1));

      // Call startQuiz
      result.current.startQuiz();

      // Verify navigation was called with correct URL
      expect(mockNavigate).toHaveBeenCalledWith('/officialquizzes/lcsp/1');
    });

    it('navigates correctly for different course codes', async () => {
      overrideMockSelectedCourseAndLessons({
        course: { id: 2, name: 'Spanish in One Month' } as any,
        toLesson: { lessonNumber: 3 } as any,
        isLoading: false,
      });

      const { result } = renderHook(() => useOfficialQuizSetupMenu(), {
        wrapper: Wrapper,
      });

      // Wait for state to be set
      await waitFor(() => expect(result.current.courseCode).toBe('si1m'));
      await waitFor(() => expect(result.current.quizNumber).toBe(3));

      // Call startQuiz
      result.current.startQuiz();

      // Verify navigation was called with correct URL for si1m course
      expect(mockNavigate).toHaveBeenCalledWith('/officialquizzes/si1m/3');
    });

    it('does not navigate when quizNumber is 0', async () => {
      overrideMockSelectedCourseAndLessons({
        course: { id: 1, name: 'LearnCraft Spanish' } as any,
        toLesson: { lessonNumber: 0 } as any,
        isLoading: false,
      });

      const { result } = renderHook(() => useOfficialQuizSetupMenu(), {
        wrapper: Wrapper,
      });

      // Wait for state to be set
      await waitFor(() => expect(result.current.courseCode).toBe('lcsp'));
      await waitFor(() => expect(result.current.quizNumber).toBe(0));

      // Call startQuiz
      result.current.startQuiz();

      // Verify navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('logs error and does not navigate when course is not found', async () => {
      // Spy on console.error
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Set up a course code that doesn't exist in our mock
      overrideMockSelectedCourseAndLessons({
        course: { id: 1, name: 'Unknown Course' } as any, // This will map to 'lcsp' by default
        toLesson: { lessonNumber: 1 } as any,
        isLoading: false,
      });

      const { result } = renderHook(() => useOfficialQuizSetupMenu(), {
        wrapper: Wrapper,
      });

      // Manually set a course code that doesn't exist in our mock
      await waitFor(() => {
        result.current.setUserSelectedCourseCode('nonexistent-course');
      });

      // Wait a bit for the state to update
      await waitFor(() =>
        expect(result.current.courseCode).toBe('nonexistent-course'),
      );

      // Call startQuiz
      result.current.startQuiz();

      // Verify console.error was called and navigation was not called
      expect(consoleErrorSpy).toHaveBeenCalledWith('Course not found');
      expect(mockNavigate).not.toHaveBeenCalled();

      // Clean up
      consoleErrorSpy.mockRestore();
    });
  });

  describe('setUserSelectedCourseCode function', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <TestQueryClientProvider>{children}</TestQueryClientProvider>
      </MemoryRouter>
    );

    beforeEach(() => {
      overrideMockSelectedCourseAndLessons({
        updateUserSelectedCourseId: vi.fn(),
      });
    });

    it('converts lcspx to lcsp, updates coordinator', async () => {
      const lcspCourseId =
        officialQuizCourses.find((course) => course.code === 'lcsp')
          ?.courseId ?? null;

      const { result } = renderHook(() => useOfficialQuizSetupMenu(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.courseCode).toBe('lcsp'));
      await waitFor(() => expect(result.current.quizNumber).toBe(1));

      result.current.setUserSelectedCourseCode('lcspx');

      await waitFor(() => expect(result.current.courseCode).toBe('lcspx'));
      expect(
        mockSelectedCourseAndLessons.updateUserSelectedCourseId,
      ).toHaveBeenCalledWith(lcspCourseId);
    });

    it('calls coordinator with courseId for a valid course', async () => {
      const si1mCourseId =
        officialQuizCourses.find((course) => course.code === 'si1m')
          ?.courseId ?? null;

      const { result } = renderHook(() => useOfficialQuizSetupMenu(), {
        wrapper: Wrapper,
      });

      result.current.setUserSelectedCourseCode('si1m');

      await waitFor(() =>
        expect(
          mockSelectedCourseAndLessons.updateUserSelectedCourseId,
        ).toHaveBeenCalledWith(si1mCourseId),
      );
    });
  });

  // describe block to test all switch cases for getCourseCodeFromName
  describe('getCourseCodeFromName', () => {
    it('returns lcsp for LearnCraft Spanish', () => {
      expect(getCourseCodeFromName('LearnCraft Spanish')).toBe('lcsp');
    });

    it('returns si1m for Spanish in One Month', () => {
      expect(getCourseCodeFromName('Spanish in One Month')).toBe('si1m');
    });

    it('returns post-1mc for Post-1MC Cohort', () => {
      expect(getCourseCodeFromName('Post-1MC Cohort')).toBe('post-1mc');
    });

    it('returns lcsp for Post-Podcast Lessons', () => {
      expect(getCourseCodeFromName('Post-Podcast Lessons')).toBe('lcsp');
    });

    it('returns ser-estar for Ser Estar Mini Course', () => {
      expect(getCourseCodeFromName('Ser Estar Mini Course')).toBe('ser-estar');
    });

    it('returns lcsp for unknown course names (default case)', () => {
      expect(getCourseCodeFromName('Unknown Course')).toBe('lcsp');
      expect(getCourseCodeFromName('')).toBe('lcsp');
      expect(getCourseCodeFromName('Random Name')).toBe('lcsp');
    });
  });
});
