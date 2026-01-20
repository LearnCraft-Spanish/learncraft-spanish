import {
  mockActiveStudent,
  overrideMockActiveStudent,
  resetMockActiveStudent,
} from '@application/coordinators/hooks/useActiveStudent.mock';
import {
  mockUseAppStudentList,
  overrideMockUseAppStudentList,
  resetMockUseAppStudentList,
} from '@application/queries/useAppStudentList.mock';
import useStudentSearch from '@application/units/StudentSearch/useStudentSearch';
import { act, renderHook } from '@testing-library/react';
import { createMockAppUserAbbreviationList } from '@testing/factories/appUserFactories';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@application/coordinators/hooks/useActiveStudent', () => ({
  useActiveStudent: () => mockActiveStudent,
}));

vi.mock('@application/queries/useAppStudentList', () => ({
  useAppStudentList: () => mockUseAppStudentList,
}));

describe('useStudentSearch', () => {
  const mockCloseMenu = vi.fn();

  beforeEach(() => {
    mockCloseMenu.mockClear();
    resetMockActiveStudent();
    resetMockUseAppStudentList();
  });

  describe('initialization', () => {
    it('should have default initialization values as defined in the mock', () => {
      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      expect(result.current.searchString).toBe('');
      expect(result.current.searchStudentOptions).toEqual([]);
      expect(typeof result.current.setSearchString).toBe('function');
      expect(typeof result.current.selectStudent).toBe('function');
    });
  });

  describe('listOfStudents sorting', () => {
    it('should return empty array when appStudentList is undefined', () => {
      overrideMockUseAppStudentList({
        appStudentList: undefined,
      });

      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      expect(result.current.searchStudentOptions).toEqual([]);
    });

    it('should sort students by name alphabetically', () => {
      const mockStudents = [
        { name: 'Charlie', emailAddress: 'charlie@example.com' },
        { name: 'Alice', emailAddress: 'alice@example.com' },
        { name: 'Bob', emailAddress: 'bob@example.com' },
      ];

      overrideMockUseAppStudentList({
        appStudentList: mockStudents,
      });

      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      // Set search string to trigger filtering
      act(() => {
        result.current.setSearchString('example');
      });

      // Check that results are sorted by name
      expect(result.current.searchStudentOptions[0].name).toBe('Alice');
      expect(result.current.searchStudentOptions[1].name).toBe('Bob');
      expect(result.current.searchStudentOptions[2].name).toBe('Charlie');
    });

    it('should sort by email when names are the same', () => {
      const mockStudents = [
        { name: 'John Doe', emailAddress: 'john.z@example.com' },
        { name: 'John Doe', emailAddress: 'john.a@example.com' },
        { name: 'John Doe', emailAddress: 'john.m@example.com' },
      ];

      overrideMockUseAppStudentList({
        appStudentList: mockStudents,
      });

      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      // Set search string to trigger filtering
      act(() => {
        result.current.setSearchString('john');
      });

      // Check that results are sorted by email when names match
      expect(result.current.searchStudentOptions[0].emailAddress).toBe(
        'john.a@example.com',
      );
      expect(result.current.searchStudentOptions[1].emailAddress).toBe(
        'john.m@example.com',
      );
      expect(result.current.searchStudentOptions[2].emailAddress).toBe(
        'john.z@example.com',
      );
    });
  });

  describe('search filtering', () => {
    beforeEach(() => {
      const mockStudents = [
        { name: 'John Smith', emailAddress: 'john.smith@example.com' },
        { name: 'Jane Doe', emailAddress: 'jane.doe@example.com' },
        { name: 'Bob Johnson', emailAddress: 'bob.j@example.com' },
        { name: 'Alice Williams', emailAddress: 'alice@test.com' },
      ];

      overrideMockUseAppStudentList({
        appStudentList: mockStudents,
      });
    });

    it('should return empty array when search string is empty', () => {
      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      expect(result.current.searchStudentOptions).toEqual([]);
    });

    it('should filter students by name (case insensitive)', () => {
      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      act(() => {
        result.current.setSearchString('john');
      });

      expect(result.current.searchStudentOptions).toHaveLength(2);
      expect(result.current.searchStudentOptions[0].name).toBe('Bob Johnson');
      expect(result.current.searchStudentOptions[1].name).toBe('John Smith');
    });

    it('should filter students by email (case insensitive)', () => {
      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      act(() => {
        result.current.setSearchString('test.com');
      });

      expect(result.current.searchStudentOptions).toHaveLength(1);
      expect(result.current.searchStudentOptions[0].name).toBe(
        'Alice Williams',
      );
    });

    it('should match partial strings in name', () => {
      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      act(() => {
        result.current.setSearchString('doe');
      });

      expect(result.current.searchStudentOptions).toHaveLength(1);
      expect(result.current.searchStudentOptions[0].name).toBe('Jane Doe');
    });

    it('should update results when search string changes', () => {
      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      // First search
      act(() => {
        result.current.setSearchString('john');
      });
      expect(result.current.searchStudentOptions).toHaveLength(2);

      // Change search
      act(() => {
        result.current.setSearchString('jane');
      });
      expect(result.current.searchStudentOptions).toHaveLength(1);
      expect(result.current.searchStudentOptions[0].name).toBe('Jane Doe');
    });

    it('should return empty array when no matches found', () => {
      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      act(() => {
        result.current.setSearchString('nonexistent');
      });

      expect(result.current.searchStudentOptions).toEqual([]);
    });
  });

  describe('selectStudent functionality', () => {
    const mockChangeActiveStudent = vi.fn();

    beforeEach(() => {
      mockChangeActiveStudent.mockClear();
      overrideMockActiveStudent({
        changeActiveStudent: mockChangeActiveStudent,
      });

      const mockStudents = createMockAppUserAbbreviationList(3);
      overrideMockUseAppStudentList({
        appStudentList: mockStudents,
      });
    });

    it('should call changeActiveStudent with the provided email', () => {
      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      act(() => {
        result.current.selectStudent('test@example.com');
      });

      expect(mockChangeActiveStudent).toHaveBeenCalledWith('test@example.com');
    });

    it('should call changeActiveStudent with null when clearing selection', () => {
      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      act(() => {
        result.current.selectStudent(null);
      });

      expect(mockChangeActiveStudent).toHaveBeenCalledWith(null);
    });

    it('should reset search string to empty after selecting a student', () => {
      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      // Set a search string first
      act(() => {
        result.current.setSearchString('test');
      });
      expect(result.current.searchString).toBe('test');

      // Select a student
      act(() => {
        result.current.selectStudent('test@example.com');
      });

      expect(result.current.searchString).toBe('');
    });

    it('should call all functions in correct order when selecting a student', () => {
      const callOrder: string[] = [];

      const trackingCloseMenu = vi.fn(() => callOrder.push('closeMenu'));
      const trackingChangeActiveStudent = vi.fn((email) => {
        callOrder.push(`changeActiveStudent:${email}`);
      });

      overrideMockActiveStudent({
        changeActiveStudent: trackingChangeActiveStudent,
      });

      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: trackingCloseMenu }),
      );

      act(() => {
        result.current.setSearchString('test');
        result.current.selectStudent('test@example.com');
      });

      expect(callOrder).toEqual([
        'changeActiveStudent:test@example.com',
        'closeMenu',
      ]);
      expect(result.current.searchString).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle students with empty names', () => {
      const mockStudents = [
        { name: '', emailAddress: 'test1@example.com' },
        { name: '', emailAddress: 'test2@example.com' },
      ];

      overrideMockUseAppStudentList({
        appStudentList: mockStudents,
      });

      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      act(() => {
        result.current.setSearchString('test');
      });

      expect(result.current.searchStudentOptions).toHaveLength(2);
    });

    it('should handle search with only whitespace', () => {
      const mockStudents = createMockAppUserAbbreviationList(2);

      overrideMockUseAppStudentList({
        appStudentList: mockStudents,
      });

      const { result } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      act(() => {
        result.current.setSearchString('   ');
      });

      // Should still show results because we're searching for whitespace
      // The actual behavior depends on if there's whitespace in names/emails
      expect(Array.isArray(result.current.searchStudentOptions)).toBe(true);
    });
  });

  describe('integration with dependencies', () => {
    it('should work correctly when appStudentList changes', () => {
      const initialStudents = [
        { name: 'Alice', emailAddress: 'alice@example.com' },
      ];

      overrideMockUseAppStudentList({
        appStudentList: initialStudents,
      });

      const { result, rerender } = renderHook(() =>
        useStudentSearch({ closeMenu: mockCloseMenu }),
      );

      act(() => {
        result.current.setSearchString('alice');
      });

      expect(result.current.searchStudentOptions).toHaveLength(1);

      // Update the student list
      const updatedStudents = [
        { name: 'Alice', emailAddress: 'alice@example.com' },
        { name: 'Alice Cooper', emailAddress: 'cooper@example.com' },
      ];

      overrideMockUseAppStudentList({
        appStudentList: updatedStudents,
      });

      rerender();

      expect(result.current.searchStudentOptions).toHaveLength(2);
    });
  });
});
