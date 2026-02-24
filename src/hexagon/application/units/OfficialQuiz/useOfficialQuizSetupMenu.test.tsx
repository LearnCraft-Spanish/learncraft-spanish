import { overrideMockOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter.mock';

import { overrideMockActiveStudent } from '@application/coordinators/hooks/useActiveStudent.mock';
import {
  mockSelectedCourseAndLessons,
  overrideMockSelectedCourseAndLessons,
} from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import { useOfficialQuizSetupMenu } from '@application/units/OfficialQuiz/useOfficialQuizSetupMenu';
import { renderHook, waitFor } from '@testing-library/react';
import {
  createMockOfficialQuizRecord,
  createMockQuizGroup,
} from '@testing/factories/quizFactory';
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
      getOfficialQuizGroups: async () => [
        createMockQuizGroup({
          id: 1,
          name: 'LearnCraft Spanish',
          urlSlug: 'lcsp',
          courseId: 1,
          published: true,
          quizzes: [
            createMockOfficialQuizRecord({
              id: 1,
              relatedQuizGroupId: 1,
              quizNumber: 1,
              quizTitle: 'LCSP 1',
              published: true,
            }),
          ],
        }),
        createMockQuizGroup({
          id: 2,
          name: 'Spanish in One Month',
          urlSlug: 'si1m',
          courseId: 2,
          published: true,
          quizzes: [
            createMockOfficialQuizRecord({
              id: 2,
              relatedQuizGroupId: 2,
              quizNumber: 1,
              quizTitle: 'SI1M 1',
              published: true,
            }),
          ],
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

    await waitFor(() =>
      expect(result.current.selectedQuizGroup?.urlSlug).toBe('lcsp'),
    );
    await waitFor(() => expect(result.current.quizNumber).toBe(1));
    await waitFor(() =>
      expect(
        result.current.quizOptions.map((q) => q.relatedQuizGroupId),
      ).toEqual([1]),
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
      await waitFor(() =>
        expect(result.current.selectedQuizGroup?.urlSlug).toBe('lcsp'),
      );
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
      await waitFor(() =>
        expect(result.current.selectedQuizGroup?.urlSlug).toBe('si1m'),
      );
      await waitFor(() => expect(result.current.quizNumber).toBe(1));

      // Call startQuiz
      result.current.startQuiz();

      // Verify navigation was called with correct URL for si1m course
      expect(mockNavigate).toHaveBeenCalledWith('/officialquizzes/si1m/1');
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
      const { result } = renderHook(() => useOfficialQuizSetupMenu(), {
        wrapper: Wrapper,
      });

      await waitFor(() =>
        expect(result.current.selectedQuizGroup?.urlSlug).toBe('lcsp'),
      );
      await waitFor(() => expect(result.current.quizNumber).toBe(1));

      result.current.setSelectedQuizGroup(2);

      await waitFor(() =>
        expect(result.current.selectedQuizGroup?.urlSlug).toBe('si1m'),
      );
      expect(
        mockSelectedCourseAndLessons.updateUserSelectedCourseId,
      ).toHaveBeenCalledWith(2);
    });
  });
});
