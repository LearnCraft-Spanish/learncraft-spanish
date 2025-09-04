import type { OfficialQuizRecord } from '@learncraft-spanish/shared/dist/domain/quiz/core-types';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from 'src/hexagon/testing/factories/exampleFactory';

import { createMockOfficialQuizRecord } from 'src/hexagon/testing/factories/quizFactory';
import { TestQueryClientProvider } from 'src/hexagon/testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';
import { overrideMockQuizAdapter } from '../../adapters/quizAdapter.mock';
import { useOfficialQuiz } from './useOfficialQuiz';

const mockQuizRecords: OfficialQuizRecord[] = [];
for (let i = 0; i < 10; i++) {
  mockQuizRecords.push(
    createMockOfficialQuizRecord({
      id: i + 1,
      courseCode: 'lcsp',
      quizNumber: i + 1,
      quizTitle: `LCSP ${i + 1}`,
    }),
  );
}

const mockQuizExample = createMockExampleWithVocabularyList(10)();

describe('useOfficialQuiz', () => {
  beforeEach(() => {
    overrideMockQuizAdapter({
      getOfficialQuizRecords: async () => mockQuizRecords,
      getOfficialQuizExamples: async () => mockQuizExample,
    });
  });
  it('returns examples, loading state, error, and derived quizTitle', async () => {
    const selectedQuizRecord = mockQuizRecords[1];
    // default state already set above
    const { result } = renderHook(
      () =>
        useOfficialQuiz({
          courseCode: selectedQuizRecord.courseCode,
          quizNumber: selectedQuizRecord.quizNumber,
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
    expect(result.current.quizExamples?.length).toEqual(10);
    expect(result.current.quizTitle).toBe(selectedQuizRecord.quizTitle);
  });

  it('returns undefined quizTitle when no matching record exists', async () => {
    const { result } = renderHook(
      () => useOfficialQuiz({ courseCode: 'lcsp', quizNumber: 99 }),
      { wrapper: TestQueryClientProvider },
    );
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
    expect(result.current.quizTitle).toBeUndefined();
  });
});
