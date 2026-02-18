import {
  overrideMockUseAllQuizGroups,
  resetMockUseAllQuizGroups,
} from '@application/queries/useAllQuizGroups.mock';
import { useSearchByQuizFilter } from '@application/units/ExampleSearchInterface/Filters/useSearchByQuizFilter';
import { renderHook } from '@testing-library/react';
import {
  createMockOfficialQuizRecord,
  createMockQuizGroup,
} from '@testing/factories/quizFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useAllQuizGroups hook
vi.mock('@application/queries/useAllQuizGroups', () => ({
  useAllQuizGroups: () => overrideMockUseAllQuizGroups({}),
}));

describe('useSearchByQuizFilter', () => {
  beforeEach(() => {
    resetMockUseAllQuizGroups();
  });

  it('should return quizzes for the specified quiz group', () => {
    // Arrange
    const mockQuizzesForGroup1 = [
      createMockOfficialQuizRecord({
        id: 1,
        relatedQuizGroupId: 1,
        quizNumber: 1,
        quizTitle: 'LCSP Quiz 1',
      }),
      createMockOfficialQuizRecord({
        id: 2,
        relatedQuizGroupId: 1,
        quizNumber: 2,
        quizTitle: 'LCSP Quiz 2',
      }),
    ];

    const mockQuizzesForGroup2 = [
      createMockOfficialQuizRecord({
        id: 3,
        relatedQuizGroupId: 2,
        quizNumber: 1,
        quizTitle: 'Other Quiz 1',
      }),
    ];

    const mockQuizGroups = [
      createMockQuizGroup({
        id: 1,
        name: 'LCSP',
        urlSlug: 'lcsp',
        courseId: 1,
        quizzes: mockQuizzesForGroup1,
      }),
      createMockQuizGroup({
        id: 2,
        name: 'Other Course',
        urlSlug: 'other',
        courseId: 2,
        quizzes: mockQuizzesForGroup2,
      }),
    ];

    overrideMockUseAllQuizGroups({
      quizGroups: mockQuizGroups,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useSearchByQuizFilter({ quizGroupId: 1 }),
    );

    // Assert
    expect(result.current.quizOptions).toHaveLength(2);
    expect(result.current.quizOptions[0].id).toBe(1);
    expect(result.current.quizOptions[1].id).toBe(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return empty array when quiz group is not found', () => {
    // Arrange
    const mockQuizGroups = [
      createMockQuizGroup({
        id: 1,
        name: 'LCSP',
        urlSlug: 'lcsp',
        courseId: 1,
        quizzes: [],
      }),
    ];

    overrideMockUseAllQuizGroups({
      quizGroups: mockQuizGroups,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useSearchByQuizFilter({ quizGroupId: 999 }),
    );

    // Assert
    expect(result.current.quizOptions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return empty array when quizGroupId is undefined', () => {
    // Arrange
    const mockQuizGroups = [
      createMockQuizGroup({
        id: 1,
        name: 'LCSP',
        urlSlug: 'lcsp',
        courseId: 1,
        quizzes: [],
      }),
    ];

    overrideMockUseAllQuizGroups({
      quizGroups: mockQuizGroups,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useSearchByQuizFilter({ quizGroupId: undefined }),
    );

    // Assert
    expect(result.current.quizOptions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return empty array when query is loading', () => {
    // Arrange
    overrideMockUseAllQuizGroups({
      quizGroups: undefined,
      isLoading: true,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useSearchByQuizFilter({ quizGroupId: 1 }),
    );

    // Assert
    expect(result.current.quizOptions).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should return empty array when query has an error', () => {
    // Arrange
    const testError = new Error('Failed to fetch quiz groups');

    overrideMockUseAllQuizGroups({
      quizGroups: undefined,
      isLoading: false,
      error: testError,
    });

    // Act
    const { result } = renderHook(() =>
      useSearchByQuizFilter({ quizGroupId: 1 }),
    );

    // Assert
    expect(result.current.quizOptions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(testError);
  });
});
