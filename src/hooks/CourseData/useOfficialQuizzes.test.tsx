import { renderHook, waitFor } from '@testing-library/react';
import mockData from 'mocks/data/serverlike/serverlikeData';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { useOfficialQuizzes } from 'src/hooks/CourseData/useOfficialQuizzes';
import { describe, expect, it } from 'vitest';

const { api } = mockData();
const quizzesTable = api.quizzesTable;
const quizExamplesTableArray = api.quizExamplesTableArray;

async function renderHookLoaded() {
  const { result } = renderHook(() => useOfficialQuizzes(undefined), {
    wrapper: MockAllProviders,
  });
  await waitFor(
    () => expect(result.current.officialQuizzesQuery.isSuccess).toBe(true),
    { timeout: 5000 },
  );

  return result;
}

describe('useOfficialQuizzes', () => {
  describe('officialQuizzesQuery', () => {
    it('runs without crashing', async () => {
      const result = await renderHookLoaded();
      expect(result.current.officialQuizzesQuery.data).toBeDefined();
    });

    it('data length is mockDataLength', async () => {
      const result = await renderHookLoaded();
      expect(result.current.officialQuizzesQuery.data?.length).toBe(
        quizzesTable.length,
      );
    });
  });

  describe.skip('quizExamplesQuery', () => {
    const randomQuizTable =
      quizExamplesTableArray[
        Math.floor(Math.random() * quizExamplesTableArray.length)
      ];
    const randomQuizNickname = randomQuizTable.quizNickname;
    const randomQuizId = quizzesTable.find(
      (quiz) => quiz.quizNickname === randomQuizNickname,
    )?.recordId;
    it('runs without crashing', async () => {
      const { result } = renderHook(() => useOfficialQuizzes(randomQuizId), {
        wrapper: MockAllProviders,
      });
      await waitFor(() =>
        expect(result.current.quizExamplesQuery.isSuccess).toBe(true),
      );
      expect(result.current.quizExamplesQuery.data).toBeDefined();
    });

    it('data is mockData', async () => {
      const { result } = renderHook(() => useOfficialQuizzes(randomQuizId), {
        wrapper: MockAllProviders,
      });
      await waitFor(() =>
        expect(result.current.quizExamplesQuery.data).toEqual(
          randomQuizTable.quizExamplesTable,
        ),
      );
    });
  });
});
