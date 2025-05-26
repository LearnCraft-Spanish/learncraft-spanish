import type { FrequensayPort } from '@application/ports/frequensayPort';
import type {
  getSpellingsKnownForLessonQuery,
  getSpellingsKnownForLessonResponse,
} from '@LearnCraft-Spanish/shared';
import { createMockSpellingsData } from '@testing/factories/spellingsFactory';
import { setMockResult } from '@testing/utils/setMockResult';
import { createTypedMock } from '@testing/utils/typedMock';

// Create strongly-typed spies for each FrequensayPort method
export const mockGetSpellingsKnownForLesson = createTypedMock<
  (
    data: getSpellingsKnownForLessonQuery,
  ) => Promise<getSpellingsKnownForLessonResponse>
>().mockResolvedValue(createMockSpellingsData(5));

// Global mock for the adapter with safe default implementations
export const mockFrequensayAdapter: FrequensayPort = {
  getSpellingsKnownForLesson: mockGetSpellingsKnownForLesson,
};

// Setup function for tests to override mock behavior
export const overrideMockFrequensayAdapter = (
  config: Partial<{
    getSpellingsKnownForLesson:
      | Awaited<ReturnType<typeof mockGetSpellingsKnownForLesson>>
      | Error;
  }> = {},
) => {
  setMockResult(
    mockGetSpellingsKnownForLesson,
    config.getSpellingsKnownForLesson,
  );
};

// Always return a valid adapter mock with proper fallbacks
export const callMockFrequensayAdapter = () => {
  try {
    return mockFrequensayAdapter;
  } catch (error) {
    console.error('Error in frequensayAdapter mock, returning fallback', error);
    // Create a fresh adapter mock with defaults if the original mock fails
    return {
      getSpellingsKnownForLesson: () =>
        Promise.resolve(createMockSpellingsData(5)),
    };
  }
};

// Export the default mock for global mocking
export default mockFrequensayAdapter;
