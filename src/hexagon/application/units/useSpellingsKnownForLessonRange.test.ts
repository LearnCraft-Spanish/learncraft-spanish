import {
  mockGetSpellingsKnownForLesson,
  overrideMockFrequensayAdapter,
} from '@application/adapters/frequensayAdapter.mock';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockSpellingsData } from '@testing/factories/spellingsFactory';

import { createQueryClientWrapper } from '@testing/index';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSpellingsKnownForLessonRange } from './useSpellingsKnownForLessonRange';

describe('useSpellingsKnownForLessonRange', () => {
  beforeEach(() => {});

  it('should fetch spellings correctly', async () => {
    const mockSpellings = createMockSpellingsData(10);
    overrideMockFrequensayAdapter({
      getSpellingsKnownForLesson: mockSpellings,
    });

    const { result } = renderHook(
      () =>
        useSpellingsKnownForLessonRange({
          courseName: 'Spanish 1',
          lessonToNumber: 10,
          lessonFromNumber: 1,
        }),
      {
        wrapper: createQueryClientWrapper(),
      },
    );

    // Initial state should show loading
    expect(result.current.isLoading).toBeTruthy();
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();

    // After data loads
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetSpellingsKnownForLesson).toHaveBeenCalledWith({
      courseName: 'Spanish 1',
      lessonToNumber: '10',
      lessonFromNumber: '1',
    });
    expect(result.current.data).toEqual(mockSpellings);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch when courseName is missing', async () => {
    const { result } = renderHook(
      () =>
        useSpellingsKnownForLessonRange({
          lessonToNumber: 10,
          lessonFromNumber: 1,
        }),
      {
        wrapper: createQueryClientWrapper(),
      },
    );

    // The query should not be enabled
    expect(mockGetSpellingsKnownForLesson).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should not fetch when lessonToNumber is missing', async () => {
    const { result } = renderHook(
      () =>
        useSpellingsKnownForLessonRange({
          courseName: 'Spanish 1',
          lessonFromNumber: 1,
        }),
      {
        wrapper: createQueryClientWrapper(),
      },
    );

    // The query should not be enabled
    expect(mockGetSpellingsKnownForLesson).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors correctly', async () => {
    const testError = new Error('API Error');

    overrideMockFrequensayAdapter({
      getSpellingsKnownForLesson: testError,
    });

    const { result } = renderHook(
      () =>
        useSpellingsKnownForLessonRange({
          courseName: 'Spanish 1',
          lessonToNumber: 10,
          lessonFromNumber: 1,
        }),
      {
        wrapper: createQueryClientWrapper(),
      },
    );

    // Wait for the query to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    // Check that error state is handled correctly
    expect(result.current.error).toBe(testError);
    expect(result.current.data).toBeUndefined();
  });
});
