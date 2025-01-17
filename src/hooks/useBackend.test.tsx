import { act } from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import type {
  QuizExamplesTable,
  QuizUnparsed,
} from 'src/types/interfaceDefinitions';
import serverlikeData from 'mocks/data/serverlike/serverlikeData';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { setupMockAuth } from 'tests/setupMockAuth';

import { useBackend } from './useBackend';

const { api } = serverlikeData();

describe('useBackend Hook', () => {
  let hookResult: ReturnType<typeof useBackend>;

  // Initialize the hook before all tests
  beforeAll(() => {
    setupMockAuth();
    const { result } = renderHook(() => useBackend(), {
      wrapper: MockAllProviders,
    });
    hookResult = result.current; // Store the current hook result once
  });

  it('renders without crashing', async () => {
    await waitFor(() => expect(hookResult).toBeDefined());
    expect(hookResult).toBeDefined();
  });

  describe('getAccessToken function', () => {
    it('returns a string when logged in', async () => {
      const token = await hookResult.getAccessToken();
      expect(token).toBeDefined();
    });
    it('does not return a string when not logged in', async () => {
      setupMockAuth({
        isAuthenticated: false,
        isLoading: false,
        userName: null,
      });
      const unauthHookResult = renderHook(() => useBackend(), {
        wrapper: MockAllProviders,
      }).result.current;
      const token = await unauthHookResult.getAccessToken();
      expect(token).toBeUndefined();
    });
  });

  // Reusable test function for array-returning functions
  async function testArrayFetchFunction({
    functionName,
    expectedLength,
    requiredFields,
    functionParams,
  }: {
    functionName: keyof ReturnType<typeof useBackend>;
    expectedLength?: number;
    requiredFields: string[];
    functionParams?: number;
  }) {
    describe(`${String(functionName)} function`, () => {
      let data: any[];

      it('resolves the fetch function and returns truthy data', async () => {
        const fetchFunction = hookResult[functionName] as (
          functionParams?: number,
        ) => Promise<any[]>;

        // Explicitly handle the async call inside the test case
        try {
          await act(async () => {
            data = await fetchFunction(functionParams);
          });
          expect(data).toBeDefined();
        } catch (error) {
          // Fail the test if the promise rejects
          throw new Error(
            `Failed to fetch data in ${String(functionName)}: ${error}`,
          );
        }
      });

      if (expectedLength !== undefined) {
        it(`returns an array of length ${expectedLength}`, () => {
          expect(data).toHaveLength(expectedLength);
        });
      }

      requiredFields.forEach((field) => {
        it(`has the required field: ${field}`, () => {
          data.forEach((item) => {
            expect(item[field]).toBeDefined();
          });
        });
      });
    });
  }

  // Reusable test function for object-returning functions
  async function testObjectFetchFunction({
    functionName,
    requiredFields,
  }: {
    functionName: keyof ReturnType<typeof useBackend>;
    requiredFields: string[];
  }) {
    describe(`${String(functionName)} function`, () => {
      let data: any;

      it('resolves the fetch function and returns truthy data', async () => {
        const fetchFunction = hookResult[functionName] as () => Promise<any>;

        // Explicitly handle the async call inside the test case
        try {
          await act(async () => {
            data = await fetchFunction();
          });
          expect(data).toBeDefined();
        } catch (error) {
          // Fail the test if the promise rejects
          throw new Error(
            `Failed to fetch data in ${String(functionName)}: ${error}`,
          );
        }
      });

      requiredFields.forEach((field) => {
        it(`has the required field: ${field}`, () => {
          expect(data[field]).toBeDefined();
        });
      });
    });
  }

  testArrayFetchFunction({
    functionName: 'getProgramsFromBackend',
    expectedLength: 4,
    requiredFields: ['recordId', 'name'],
  });

  testArrayFetchFunction({
    functionName: 'getLessonsFromBackend',
    requiredFields: ['recordId', 'lesson'],
  });

  testArrayFetchFunction({
    functionName: 'getVocabFromBackend',
    requiredFields: ['recordId', 'wordIdiom'],
  });

  testArrayFetchFunction({
    functionName: 'getSpellingsFromBackend',
    requiredFields: ['relatedWordIdiom', 'spellingOption'],
  });

  testArrayFetchFunction({
    functionName: 'getVerifiedExamplesFromBackend',
    requiredFields: ['recordId', 'spanishExample', 'englishTranslation'],
  });

  testArrayFetchFunction({
    functionName: 'getAudioExamplesFromBackend',
    requiredFields: ['recordId', 'spanishAudioLa', 'englishAudio'],
  });

  testArrayFetchFunction({
    functionName: 'getLcspQuizzesFromBackend',
    requiredFields: ['recordId', 'quizNickname'],
  });

  testArrayFetchFunction({
    functionName: 'getAllUsersFromBackend',
    requiredFields: ['isAdmin'],
  });

  testObjectFetchFunction({
    functionName: 'getUserDataFromBackend',
    requiredFields: ['recordId', 'emailAddress', 'role'],
  });

  testObjectFetchFunction({
    functionName: 'getMyExamplesFromBackend',
    requiredFields: ['examples', 'studentExamples'],
  });

  const quizExamplesTableArray = api.quizExamplesTableArray;
  quizExamplesTableArray.forEach((quizExamplesObject: QuizExamplesTable) => {
    const quizNickname = quizExamplesObject.quizNickname;
    const quizId = api.quizzesTable.find(
      (quiz: QuizUnparsed) => quiz.quizNickname === quizNickname,
    )?.recordId;
    if (!quizId) {
      throw new Error('Quiz ID not found');
    }
    // console.log('quiz record id: ', quizId)
    testArrayFetchFunction({
      functionName: 'getQuizExamplesFromBackend',
      functionParams: quizId,
      requiredFields: ['recordId', 'spanishExample', 'englishTranslation'],
    });
  });

  describe('createMyStudentExample function', () => {
    it('creates a student example', async () => {
      const response = await hookResult.createMyStudentExample(1);
      expect(response).toBe('1');
    });
    it('returns 0 when creating a student example with bad exampleId', async () => {
      const response = await hookResult.createMyStudentExample(-1);
      expect(response).toBe('0');
    });
  });
  describe('createStudentExample function', () => {
    it('creates a student example', async () => {
      const response = await hookResult.createStudentExample(1, 1);
      expect(response).toBe('1');
    });

    it('returns 0 when creating a student example with bad exampleId', async () => {
      const response = await hookResult.createStudentExample(-1, 1);
      expect(response).toBe('0');
    });
    it('returns 0 when creating a student example with bad studentId', async () => {
      const response = await hookResult.createStudentExample(1, -1);
      expect(response).toBe('0');
    });
  });
  describe('updateMyStudentExample function', () => {
    it('updates a student example', async () => {
      const response = await hookResult.updateMyStudentExample(1, 2);
      expect(response).toBe('1');
    });
    it('returns 0 when updating a student example with bad updateId', async () => {
      const response = await hookResult.updateMyStudentExample(-1, 2);
      expect(response).toBe('0');
    });
  });
  describe('updateStudentExample function', () => {
    it('updates a student example', async () => {
      const response = await hookResult.updateStudentExample(1, 2);
      expect(response).toBe('1');
    });
    it('returns 0 when updating a student example with bad updateId', async () => {
      const response = await hookResult.updateStudentExample(-1, 2);
      expect(response).toBe('0');
    });
  });

  describe('deleteMyStudentExample function', () => {
    it('deletes a student example', async () => {
      const response = await hookResult.deleteMyStudentExample(1);
      expect(response).toBe('1');
    });
    it('returns 0 when deleting a student example with bad recordId', async () => {
      const response = await hookResult.deleteMyStudentExample(-1);
      expect(response).toBe('0');
    });
  });

  describe('deleteStudentExample function', () => {
    it('deletes a student example', async () => {
      const response = await hookResult.deleteStudentExample(1);
      expect(response).toBe('1');
    });
    it('returns 0 when deleting a student example with bad recordId', async () => {
      const response = await hookResult.deleteStudentExample(-1);
      expect(response).toBe('0');
    });
  });
});
