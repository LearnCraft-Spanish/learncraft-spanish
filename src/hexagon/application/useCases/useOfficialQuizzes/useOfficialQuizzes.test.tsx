import { officialQuizCourses } from '@learncraft-spanish/shared';
import { renderHook, waitFor } from '@testing-library/react';

import { TestQueryClientProvider } from 'src/hexagon/testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideMockAuthAdapter } from '../../adapters/authAdapter.mock';
import { overrideMockOfficialQuizAdapter } from '../../adapters/officialQuizAdapter.mock';
import { overrideMockActiveStudent } from '../../coordinators/hooks/useActiveStudent.mock';
import { overrideMockSelectedCourseAndLessons } from '../../coordinators/hooks/useSelectedCourseAndLessons.mock';
import { mockUseOfficialQuizSetupMenu } from '../../units/OfficialQuiz/useOfficialQuizSetupMenu.mock';
import { useOfficialQuizzes } from './useOfficialQuizzes';

vi.mock('@application/units/OfficialQuiz/useOfficialQuizSetupMenu', () => ({
  useOfficialQuizSetupMenu: vi.fn(() => mockUseOfficialQuizSetupMenu),
}));

describe('useOfficialQuizzes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isLoading', () => {
    it('should return true when courseLoading is true', () => {
      overrideMockSelectedCourseAndLessons({
        isLoading: true,
      });

      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should return false when all loading states are false', async () => {
      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('error', () => {
    it('should return appUserError when present', () => {
      const testError = new Error('App user error');
      overrideMockActiveStudent({
        error: testError,
      });

      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.error).toEqual(testError);
    });

    it('should return officialQuizzesError when present', async () => {
      const testError = new Error('Official quizzes error');
      overrideMockOfficialQuizAdapter({
        getOfficialQuizRecords: async () => {
          throw testError;
        },
      });

      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(testError);
      });
    });

    it('should return null when no errors are present', () => {
      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when authenticated and not loading', () => {
      overrideMockAuthAdapter({
        isLoading: false,
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.isLoggedIn).toBe(true);
    });

    it('should return false when not authenticated', () => {
      overrideMockAuthAdapter({
        isLoading: false,
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.isLoggedIn).toBe(false);
    });

    it('should return false when authenticated but still loading', () => {
      overrideMockAuthAdapter({
        isLoading: true,
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.isLoggedIn).toBe(false);
    });

    it('should return false when not authenticated and loading', () => {
      overrideMockAuthAdapter({
        isLoading: true,
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  describe('other return values', () => {
    it('should return officialQuizCourses as an array', () => {
      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.officialQuizCourses).toEqual(officialQuizCourses);
    });

    it('should return quizSetupMenuProps from useOfficialQuizSetupMenu', () => {
      const { result } = renderHook(() => useOfficialQuizzes(), {
        wrapper: TestQueryClientProvider,
      });

      expect(result.current.quizSetupMenuProps).toEqual(
        mockUseOfficialQuizSetupMenu,
      );
    });
  });
});
