import {
  mockAuthAdapter,
  overrideMockAuthAdapter,
  resetMockAuthAdapter,
} from '@application/adapters/authAdapter.mock';
import {
  mockActiveStudent,
  overrideMockActiveStudent,
  resetMockActiveStudent,
} from '@application/coordinators/hooks/useActiveStudent.mock';
import useSubHeader from '@application/units/SubHeader/useSubHeader';
import { act, renderHook } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@application/adapters/authAdapter', () => ({
  useAuthAdapter: () => mockAuthAdapter,
}));

vi.mock('@application/coordinators/hooks/useActiveStudent', () => ({
  useActiveStudent: () => mockActiveStudent,
}));

describe('useSubHeader', () => {
  beforeEach(() => {
    resetMockAuthAdapter();
    resetMockActiveStudent();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useSubHeader());

      expect(result.current.studentSelectorOpen).toBe(false);
      expect(typeof result.current.setStudentSelectorOpen).toBe('function');
      expect(typeof result.current.clearSelection).toBe('function');
    });

    it('should pass through auth adapter values', () => {
      overrideMockAuthAdapter({
        isAuthenticated: true,
        isAdmin: true,
        isCoach: false,
        isLoading: false,
      });

      const { result } = renderHook(() => useSubHeader());

      expect(result.current.authLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isCoach).toBe(false);
    });

    it('should pass through active student values', () => {
      const mockUser = createMockAppUser();
      overrideMockActiveStudent({
        appUser: mockUser,
        isOwnUser: true,
        isLoading: false,
      });

      const { result } = renderHook(() => useSubHeader());

      expect(result.current.appUser).toEqual(mockUser);
      expect(result.current.isOwnUser).toBe(true);
      expect(result.current.activeStudentLoading).toBe(false);
    });
  });

  describe('helper booleans', () => {
    describe('freeUser', () => {
      it('should be true when authenticated, no appUser, not loading, and not admin/coach', () => {
        overrideMockAuthAdapter({
          isAuthenticated: true,
          isAdmin: false,
          isCoach: false,
        });
        overrideMockActiveStudent({
          appUser: null,
          isLoading: false,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.freeUser).toBe(true);
      });
    });

    describe('notLoggedIn', () => {
      it('should be true when not loading and not authenticated', () => {
        overrideMockAuthAdapter({
          isLoading: false,
          isAuthenticated: false,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.notLoggedIn).toBe(true);
      });

      it('should be false when authenticated', () => {
        overrideMockAuthAdapter({
          isLoading: false,
          isAuthenticated: true,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.notLoggedIn).toBe(false);
      });

      it('should be false when still loading', () => {
        overrideMockAuthAdapter({
          isLoading: true,
          isAuthenticated: false,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.notLoggedIn).toBe(false);
      });
    });

    describe('loggingIn', () => {
      it('should match authLoading state', () => {
        overrideMockAuthAdapter({
          isLoading: true,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.loggingIn).toBe(true);
      });
    });

    describe('studentUser', () => {
      it('should be true when authenticated, has appUser, not loading, and not admin/coach', () => {
        overrideMockAuthAdapter({
          isAuthenticated: true,
          isAdmin: false,
          isCoach: false,
        });
        overrideMockActiveStudent({
          appUser: createMockAppUser(),
          isLoading: false,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.studentUser).toBe(true);
      });

      it('should be false when no appUser', () => {
        overrideMockAuthAdapter({
          isAuthenticated: true,
          isAdmin: false,
          isCoach: false,
        });
        overrideMockActiveStudent({
          appUser: null,
          isLoading: false,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.studentUser).toBeFalsy();
      });

      it('should be false when user is coach', () => {
        overrideMockAuthAdapter({
          isAuthenticated: true,
          isAdmin: false,
          isCoach: true,
        });
        overrideMockActiveStudent({
          appUser: createMockAppUser(),
          isLoading: false,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.studentUser).toBe(false);
      });
    });

    describe('isCoachOrAdmin', () => {
      it('should be true when user is admin', () => {
        overrideMockAuthAdapter({
          isAdmin: true,
          isCoach: false,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.isCoachOrAdmin).toBe(true);
      });

      it('should be true when user is coach', () => {
        overrideMockAuthAdapter({
          isAdmin: false,
          isCoach: true,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.isCoachOrAdmin).toBe(true);
      });

      it('should be false when user is neither admin nor coach', () => {
        overrideMockAuthAdapter({
          isAdmin: false,
          isCoach: false,
        });

        const { result } = renderHook(() => useSubHeader());

        expect(result.current.isCoachOrAdmin).toBe(false);
      });
    });
  });

  describe('studentSelectorOpen state', () => {
    it('should update when setStudentSelectorOpen is called', () => {
      const { result } = renderHook(() => useSubHeader());

      expect(result.current.studentSelectorOpen).toBe(false);

      act(() => {
        result.current.setStudentSelectorOpen(true);
      });

      expect(result.current.studentSelectorOpen).toBe(true);

      act(() => {
        result.current.setStudentSelectorOpen(false);
      });

      expect(result.current.studentSelectorOpen).toBe(false);
    });
  });

  describe('clearSelection', () => {
    it('should call changeActiveStudent with null', () => {
      const mockChangeActiveStudent = vi.fn();
      overrideMockActiveStudent({
        changeActiveStudent: mockChangeActiveStudent,
      });

      const { result } = renderHook(() => useSubHeader());

      act(() => {
        result.current.clearSelection();
      });

      expect(mockChangeActiveStudent).toHaveBeenCalledWith(null);
    });

    it('should set studentSelectorOpen to false', () => {
      const { result } = renderHook(() => useSubHeader());

      // First open the selector
      act(() => {
        result.current.setStudentSelectorOpen(true);
      });
      expect(result.current.studentSelectorOpen).toBe(true);

      // Clear selection should close it
      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.studentSelectorOpen).toBe(false);
    });

    it('should perform both actions in correct order', () => {
      const mockChangeActiveStudent = vi.fn();
      overrideMockActiveStudent({
        changeActiveStudent: mockChangeActiveStudent,
      });

      const { result } = renderHook(() => useSubHeader());

      act(() => {
        result.current.setStudentSelectorOpen(true);
      });

      act(() => {
        result.current.clearSelection();
      });

      expect(mockChangeActiveStudent).toHaveBeenCalledWith(null);
      expect(result.current.studentSelectorOpen).toBe(false);
    });
  });
});
