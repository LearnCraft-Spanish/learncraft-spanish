import {
  overrideMockUseOfficialQuizzesQuery,
  resetMockUseOfficialQuizzesQuery,
} from '@application/queries/useOfficialQuizzesQuery.mock';
import { useSearchByQuizFilter } from '@application/units/ExampleSearchInterface/Filters/useSearchByQuizFilter';
import { renderHook } from '@testing-library/react';
import {
  createMockOfficialQuizRecord,
  createMockQuizGroup,
} from '@testing/factories/quizFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useOfficialQuizzesQuery hook
vi.mock('@application/queries/useOfficialQuizzesQuery', () => ({
  useOfficialQuizzesQuery: () => overrideMockUseOfficialQuizzesQuery({}),
}));

describe('useSearchByQuizFilter', () => {
  beforeEach(() => {
    resetMockUseOfficialQuizzesQuery();
  });

  it('should filter quizzes by course code correctly', () => {
    // Arrange

    const mockQuizRecords = [
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
        quizzes: mockQuizRecords,
      }),
    ];

    overrideMockUseOfficialQuizzesQuery({
      officialQuizRecords: mockQuizRecords,
      quizGroups: mockQuizGroups,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useSearchByQuizFilter({ courseCode: 'lcsp' }),
    );

    // Assert
    expect(result.current.quizOptions).toHaveLength(3);
    expect(result.current.quizOptions[0].relatedQuizGroupId).toBe(1);
    expect(result.current.quizOptions[1].relatedQuizGroupId).toBe(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return empty array when query has an error', () => {
    // Arrange
    const testError = new Error('Failed to fetch quiz records');

    overrideMockUseOfficialQuizzesQuery({
      officialQuizRecords: undefined,
      isLoading: false,
      error: testError,
    });

    // Act
    const { result } = renderHook(() =>
      useSearchByQuizFilter({ courseCode: 'lcsp' }),
    );

    // Assert
    expect(result.current.quizOptions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(testError);
  });
});
