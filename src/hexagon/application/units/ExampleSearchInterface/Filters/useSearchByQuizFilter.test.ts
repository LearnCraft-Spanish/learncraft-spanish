import {
  overrideMockUseOfficialQuizzesQuery,
  resetMockUseOfficialQuizzesQuery,
} from '@application/queries/useOfficialQuizzesQuery.mock';
import { useSearchByQuizFilter } from '@application/units/ExampleSearchInterface/Filters/useSearchByQuizFilter';
import { renderHook } from '@testing-library/react';
import { createMockOfficialQuizRecord } from '@testing/factories/quizFactory';
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
        courseCode: 'lcsp',
        quizNumber: 1,
        quizTitle: 'LCSP Quiz 1',
      }),
      createMockOfficialQuizRecord({
        id: 2,
        courseCode: 'lcsp',
        quizNumber: 2,
        quizTitle: 'LCSP Quiz 2',
      }),
      createMockOfficialQuizRecord({
        id: 3,
        courseCode: 'other',
        quizNumber: 1,
        quizTitle: 'Other Quiz 1',
      }),
    ];

    overrideMockUseOfficialQuizzesQuery({
      officialQuizRecords: mockQuizRecords,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useSearchByQuizFilter({ courseCode: 'lcsp' }),
    );

    // Assert
    expect(result.current.quizOptions).toHaveLength(2);
    expect(result.current.quizOptions[0].courseCode).toBe('lcsp');
    expect(result.current.quizOptions[1].courseCode).toBe('lcsp');
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
