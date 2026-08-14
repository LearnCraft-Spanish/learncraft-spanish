import type { ReachableSkills } from '@learncraft-spanish/shared';
import {
  mockSkillTagsAdapter,
  overrideMockSkillTagsAdapter,
} from '@application/adapters/skillTagsAdapter.mock';
import { useReachableSkills } from '@application/queries/useReachableSkills';
import { generateVirtualLessonId } from '@domain/coursePrerequisites';
import { renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

const mockReachableSkills: ReachableSkills = {
  vocabularyIds: [1, 2],
  subcategoryIds: [3],
  verbIds: [4],
  conjugationTags: ['present'],
};

function renderReachableSkills(
  courseId: number | null,
  fromLessonNumber: number | null,
  toLessonNumber: number | null,
  enabled?: boolean,
) {
  return renderHook(
    () =>
      useReachableSkills(courseId, fromLessonNumber, toLessonNumber, enabled),
    { wrapper: TestQueryClientProvider },
  );
}

describe('useReachableSkills', () => {
  it('fetches reachable skills for the selected course and lesson range', async () => {
    overrideMockSkillTagsAdapter({
      getReachableSkills: async () => mockReachableSkills,
    });

    const { result } = renderReachableSkills(2, 5, 20);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reachableSkills).toEqual(mockReachableSkills);
    expect(result.current.error).toBeNull();
    expect(mockSkillTagsAdapter.getReachableSkills).toHaveBeenCalledWith({
      lessonRanges: [{ courseId: 2, fromLessonNumber: 5, toLessonNumber: 20 }],
    });
  });

  it('still fetches when fromLessonNumber is null, defaulting the range start to 1', async () => {
    overrideMockSkillTagsAdapter({
      getReachableSkills: async () => mockReachableSkills,
    });

    const { result } = renderReachableSkills(2, null, 20);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reachableSkills).toEqual(mockReachableSkills);
    expect(mockSkillTagsAdapter.getReachableSkills).toHaveBeenCalledWith({
      lessonRanges: [{ courseId: 2, fromLessonNumber: 1, toLessonNumber: 20 }],
    });
  });

  it('resolves a virtual prerequisite from-lesson into real lesson ranges', async () => {
    overrideMockSkillTagsAdapter({
      getReachableSkills: async () => mockReachableSkills,
    });

    const virtualFromLesson = generateVirtualLessonId(5, 0);
    const { result } = renderReachableSkills(5, virtualFromLesson, 10);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockSkillTagsAdapter.getReachableSkills).toHaveBeenCalledWith({
      lessonRanges: [
        { courseId: 3, fromLessonNumber: 1, toLessonNumber: 20 },
        { courseId: 5, fromLessonNumber: 1, toLessonNumber: 10 },
      ],
    });
  });

  it('does not fetch when courseId is missing', async () => {
    const { result } = renderReachableSkills(null, 1, 20);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reachableSkills).toBeUndefined();
    expect(mockSkillTagsAdapter.getReachableSkills).not.toHaveBeenCalled();
  });

  it('does not fetch when toLessonNumber is missing', async () => {
    const { result } = renderReachableSkills(2, 1, null);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reachableSkills).toBeUndefined();
    expect(mockSkillTagsAdapter.getReachableSkills).not.toHaveBeenCalled();
  });

  it('does not fetch when enabled is false', async () => {
    const { result } = renderReachableSkills(2, 1, 20, false);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reachableSkills).toBeUndefined();
    expect(mockSkillTagsAdapter.getReachableSkills).not.toHaveBeenCalled();
  });

  it('exposes error state when the adapter fails', async () => {
    overrideMockSkillTagsAdapter({
      getReachableSkills: async () => {
        throw new Error('Failed to fetch reachable skills');
      },
    });

    const { result } = renderReachableSkills(2, 1, 20);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.reachableSkills).toBeUndefined();
  });
});
