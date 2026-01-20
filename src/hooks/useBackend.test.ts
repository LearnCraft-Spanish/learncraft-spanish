import type {
  QuizExamplesTable,
  QuizUnparsed,
} from 'src/types/interfaceDefinitions';
import { renderHook, waitFor } from '@testing-library/react';

import serverlikeData from 'mocks/data/serverlike/serverlikeData';
import { getAuthUserFromEmail } from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { useBackend } from './useBackend';

const { api } = serverlikeData();

describe('useBackend Hook', () => {
  let hookResult: ReturnType<typeof useBackend>;

  // Initialize the hook before all tests
  beforeAll(() => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-admin@fake.not')!,
        isAuthenticated: true,
        isAdmin: true,
        isCoach: true,
        isStudent: true,
        isLimited: false,
      },
      {
        isOwnUser: true,
      },
    );
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
    beforeEach(() => {
      overrideAuthAndAppUser({
        authUser: getAuthUserFromEmail('student-admin@fake.not')!,
        isAuthenticated: true,
        isAdmin: true,
        isCoach: true,
        isStudent: true,
        isLimited: false,
      });
      const { result } = renderHook(() => useBackend(), {
        wrapper: MockAllProviders,
      });
      hookResult = result.current; // Store the current hook result once
    });

    it('returns a string when logged in', async () => {
      const token = await hookResult.getAccessToken(['']);
      expect(token).toBeDefined();
    });
    it('does not return a string when not logged in', async () => {
      overrideAuthAndAppUser(
        {
          authUser: undefined,
          isAuthenticated: false,
          isLoading: false,
        },
        {
          appUser: undefined,
          isLoading: false,
          error: null,
          isOwnUser: false,
        },
      );
      const unauthHookResult = renderHook(() => useBackend(), {
        wrapper: MockAllProviders,
      }).result.current;
      const token = await unauthHookResult.getAccessToken(['']);
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

      beforeEach(() => {
        overrideAuthAndAppUser({
          authUser: getAuthUserFromEmail('student-admin@fake.not')!,
          isAuthenticated: true,
          isAdmin: true,
          isCoach: true,
          isStudent: true,
          isLimited: false,
        });
        const { result } = renderHook(() => useBackend(), {
          wrapper: MockAllProviders,
        });
        hookResult = result.current; // Store the current hook result once
      });

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

      beforeEach(() => {
        overrideAuthAndAppUser({
          authUser: getAuthUserFromEmail('student-admin@fake.not')!,
          isAuthenticated: true,
          isAdmin: true,
          isCoach: true,
          isStudent: true,
          isLimited: false,
        });
        const { result } = renderHook(() => useBackend(), {
          wrapper: MockAllProviders,
        });
        hookResult = result.current; // Store the current hook result once
      });

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
    functionName: 'getLcspQuizzesFromBackend',
    requiredFields: ['recordId', 'quizNickname'],
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
    testArrayFetchFunction({
      functionName: 'getQuizExamplesFromBackend',
      functionParams: quizId,
      requiredFields: ['recordId', 'spanishExample', 'englishTranslation'],
    });
  });

  describe('createMyStudentExample function', () => {
    it('creates a student example', async () => {
      const response = await hookResult.createMyStudentExample(1);
      expect(response[0]).toBeGreaterThan(0);
    });
    it('returns 0 when creating a student example with bad exampleId', async () => {
      const response = await hookResult.createMyStudentExample(-1);
      expect(response).toBe('0');
    });
  });
  describe('createStudentExample function', () => {
    it('creates a student example', async () => {
      const response = await hookResult.createStudentExample(1, 1);
      expect(response[0]).toBeGreaterThan(0);
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
