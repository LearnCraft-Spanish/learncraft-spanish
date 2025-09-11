import { useOfficialQuizzesQuery } from '@application/queries/useOfficialQuizzesQuery';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { overrideMockAuthAdapter } from '../../adapters/authAdapter.mock';
import { overrideMockActiveStudent } from '../../coordinators/hooks/useActiveStudent.mock';
import { overrideMockSelectedCourseAndLessons } from '../../coordinators/hooks/useSelectedCourseAndLessons.mock';
import { useOfficialQuizSetupMenu } from '../../units/OfficialQuiz/useOfficialQuizSetupMenu';
import { useOfficialQuizzes } from './useOfficialQuizzes';

// Mock only the hooks that aren't globally mocked yet
vi.mock('@application/queries/useOfficialQuizzesQuery');
vi.mock('../../units/OfficialQuiz/useOfficialQuizSetupMenu');
vi.mock('@learncraft-spanish/shared', () => ({
  officialQuizCourses: {
    course1: { id: 1, name: 'Course 1' },
    course2: { id: 2, name: 'Course 2' },
  },
}));

const mockUseOfficialQuizzesQuery = vi.mocked(useOfficialQuizzesQuery);
const mockUseOfficialQuizSetupMenu = vi.mocked(useOfficialQuizSetupMenu);

describe('useOfficialQuizzes', () => {
  const mockQuizSetupMenuProps = {
    courseCode: 'lcsp',
    setUserSelectedCourseCode: vi.fn(),
    quizNumber: 1,
    setUserSelectedQuizNumber: vi.fn(),
    quizOptions: [],
    startQuiz: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Use global mock overrides for the globally mocked hooks
    overrideMockSelectedCourseAndLessons({
      isLoading: false,
      error: null,
    });

    overrideMockActiveStudent({
      isLoading: false,
      error: null,
    });

    overrideMockAuthAdapter({
      isLoading: false,
      isAuthenticated: true,
    });

    // Mock the hooks that aren't globally mocked
    mockUseOfficialQuizzesQuery.mockReturnValue({
      isLoading: false,
      error: null,
      officialQuizRecords: [],
    });

    mockUseOfficialQuizSetupMenu.mockReturnValue(mockQuizSetupMenuProps);
  });

  describe('isLoading', () => {
    it('should return true when courseLoading is true', () => {
      overrideMockSelectedCourseAndLessons({
        isLoading: true,
      });

      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return true when appUserLoading is true', () => {
      overrideMockActiveStudent({
        isLoading: true,
      });

      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return true when officialQuizzesLoading is true', () => {
      mockUseOfficialQuizzesQuery.mockReturnValue({
        isLoading: true,
        error: null,
        officialQuizRecords: [],
      });

      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return false when all loading states are false', () => {
      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error', () => {
    it('should return appUserError when present', () => {
      const testError = new Error('App user error');
      overrideMockActiveStudent({
        error: testError,
      });

      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.error).toBe(testError);
    });

    it('should return officialQuizzesError when present', () => {
      const testError = new Error('Official quizzes error');
      mockUseOfficialQuizzesQuery.mockReturnValue({
        isLoading: false,
        error: testError,
        officialQuizRecords: [],
      });

      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.error).toBe(testError);
    });

    it('should return null when no errors are present', () => {
      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.error).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when authenticated and not loading', () => {
      overrideMockAuthAdapter({
        isLoading: false,
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.isLoggedIn).toBe(true);
    });

    it('should return false when not authenticated', () => {
      overrideMockAuthAdapter({
        isLoading: false,
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.isLoggedIn).toBe(false);
    });

    it('should return false when authenticated but still loading', () => {
      overrideMockAuthAdapter({
        isLoading: true,
        isAuthenticated: true,
      });

      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.isLoggedIn).toBe(false);
    });

    it('should return false when not authenticated and loading', () => {
      overrideMockAuthAdapter({
        isLoading: true,
        isAuthenticated: false,
      });

      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  describe('other return values', () => {
    it('should return officialQuizCourses as an array', () => {
      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.officialQuizCourses).toEqual([
        { id: 1, name: 'Course 1' },
        { id: 2, name: 'Course 2' },
      ]);
    });

    it('should return quizSetupMenuProps from useOfficialQuizSetupMenu', () => {
      const { result } = renderHook(() => useOfficialQuizzes());

      expect(result.current.quizSetupMenuProps).toBe(mockQuizSetupMenuProps);
    });
  });
});
