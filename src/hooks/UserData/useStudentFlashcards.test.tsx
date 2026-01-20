import { renderHook, waitFor } from '@testing-library/react';
import { examples } from 'mocks/data/examples.json';
import {
  appUserTable,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';

import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { beforeEach, describe, expect, it } from 'vitest';
import { useStudentFlashcards } from './useStudentFlashcards';

async function renderHookSuccessfully() {
  const { result } = renderHook(useStudentFlashcards, {
    wrapper: MockAllProviders,
  });
  await waitFor(() => {
    expect(result.current.flashcardDataQuery.isSuccess).toBeTruthy();
  });
  return {
    flashcardDataQuery: result.current.flashcardDataQuery,
    exampleIsCollected: result.current.exampleIsCollected,
    exampleIsPending: result.current.exampleIsPending,
    addFlashcardMutation: result.current.addFlashcardMutation,
    removeFlashcardMutation: result.current.removeFlashcardMutation,
  };
}

describe('test by role', () => {
  describe('user is student with flashcards', () => {
    const studentUsers = appUserTable.filter(
      (student) =>
        student.studentRole === 'student' &&
        student.name !== 'student-no-flashcards',
    );
    for (const student of studentUsers) {
      beforeEach(() => {
        overrideAuthAndAppUser({
          // Non-null assertion: We're only getting student users from the list.
          authUser: getAuthUserFromEmail(student.emailAddress)!,
          isAuthenticated: true,
          isAdmin: false,
          isCoach: false,
          isStudent: true,
          isLimited: false,
        });
      });
      it(`${student.name}: has flashcard data`, async () => {
        const {
          flashcardDataQuery,
          exampleIsCollected,
          exampleIsPending,
          addFlashcardMutation,
          removeFlashcardMutation,
        } = await renderHookSuccessfully();
        // assertions
        expect(flashcardDataQuery.isSuccess).toBeTruthy();
        expect(exampleIsCollected).toBeDefined();
        expect(exampleIsPending).toBeDefined();
        expect(addFlashcardMutation).toBeDefined();
        expect(removeFlashcardMutation).toBeDefined();
        await waitFor(() => {
          // Check for length
          expect(flashcardDataQuery.data?.examples.length).toBeGreaterThan(0);
        });
      });
    }
  });
  describe('user is not student', () => {
    const nonStudentUsers = appUserTable.filter(
      (student) => student.studentRole !== 'student',
    );
    for (const student of nonStudentUsers) {
      beforeEach(() => {
        overrideAuthAndAppUser({
          authUser: getAuthUserFromEmail(student.emailAddress) ?? undefined,
          isAuthenticated: true,
          isAdmin: false,
          isCoach: false,
          isStudent: false,
          isLimited: false,
        });
      });
      it(`${student.name}: flashcardDataQuery throws an error`, async () => {
        const { result } = renderHook(useStudentFlashcards, {
          wrapper: MockAllProviders,
        });
        await waitFor(() => {
          expect(result.current.flashcardDataQuery.isError).toBeTruthy();
        });
      });
    }
  });
});

describe('removeFlashcardMutation', () => {
  beforeEach(() => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isAdmin: false,
      isCoach: false,
      isStudent: true,
      isLimited: false,
    });
  });
  it('removes a flashcard successfully', async () => {
    // Initial Render
    const { result } = renderHook(useStudentFlashcards, {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.flashcardDataQuery.isSuccess).toBeTruthy();
      expect(result.current.removeFlashcardMutation).toBeDefined();
    });
    // Setup
    const flashcardDataQuery = result.current.flashcardDataQuery;
    const removeFlashcardMutation = result.current.removeFlashcardMutation;

    const initalLength = flashcardDataQuery.data?.studentExamples.length;
    if (!initalLength) throw new Error('No flashcards to remove');

    const flashcardToRemove = flashcardDataQuery.data?.examples[0];
    if (!flashcardToRemove) throw new Error('No flashcard to remove');
    // Remove a flashcard
    removeFlashcardMutation.mutate(flashcardToRemove.recordId);
    // Assertions
    await waitFor(() => {
      expect(
        result.current.flashcardDataQuery.data?.examples.length,
      ).toBeLessThan(initalLength);
    });
  });
  it('throws error when removing a flashcard that does not exist', async () => {
    // Initial Render
    const { result } = renderHook(useStudentFlashcards, {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.flashcardDataQuery.isSuccess).toBeTruthy();
      expect(result.current.removeFlashcardMutation).toBeDefined();
    });
    // Setup
    const initalLength =
      result.current.flashcardDataQuery.data?.studentExamples.length;
    if (!initalLength) throw new Error('No flashcards to remove');

    // attempt to remove a fake flashcard
    result.current.removeFlashcardMutation.mutate(-1);
    // Assertions
    await waitFor(() => {
      expect(result.current.removeFlashcardMutation.isError).toBeTruthy();
      expect(result.current.flashcardDataQuery.data?.examples.length).toBe(
        initalLength,
      );
    });
  });
});
describe('addFlashcardMutation', () => {
  beforeEach(() => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isAdmin: false,
      isCoach: false,
      isStudent: true,
      isLimited: false,
    });
  });
  it('adds a flashcard successfully', async () => {
    // Initial Render
    const { result } = renderHook(useStudentFlashcards, {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.flashcardDataQuery.isSuccess).toBeTruthy();
      expect(result.current.addFlashcardMutation).toBeDefined();
    });
    // Setup
    const flashcardDataQuery = result.current.flashcardDataQuery;

    const initalLength =
      result.current.flashcardDataQuery.data?.studentExamples.length;
    if (!initalLength) throw new Error('No flashcards to add');

    const unknownExample = examples.find(
      (example) =>
        !flashcardDataQuery.data?.examples.some(
          (flashcard) => flashcard.recordId === example.recordId,
        ),
    );
    if (!unknownExample) throw new Error('No unknown examples to add');
    // Add a flashcard
    result.current.addFlashcardMutation.mutate(unknownExample);
    // Assertions
    await waitFor(() => {
      expect(
        result.current.flashcardDataQuery.data?.examples.length,
      ).toBeGreaterThan(initalLength);
    });
  });
  it('throws error when adding a flashcard that already exists', async () => {
    // Initial Render
    const { result } = renderHook(useStudentFlashcards, {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.flashcardDataQuery.isSuccess).toBeTruthy();
      expect(result.current.addFlashcardMutation).toBeDefined();
    });
    // Setup
    const initalLength =
      result.current.flashcardDataQuery.data?.studentExamples.length;
    if (!initalLength) throw new Error('No flashcards to add');

    const knownExample = result.current.flashcardDataQuery.data?.examples[0];
    if (!knownExample) throw new Error('No known examples to add');

    // attempt to add an existing flashcard
    result.current.addFlashcardMutation.mutate(knownExample);
    // Assertions
    await waitFor(() => {
      expect(result.current.flashcardDataQuery.data?.examples.length).toBe(
        initalLength + 1,
      );
    });
  });
});

describe('exampleIsCollected', () => {
  beforeEach(() => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isAdmin: false,
      isCoach: false,
      isStudent: true,
      isLimited: false,
    });
  });
  it('returns true if example is collected', async () => {
    // Initial Render
    const { flashcardDataQuery, exampleIsCollected } =
      await renderHookSuccessfully();

    const example = flashcardDataQuery.data?.examples[0];
    if (!example) throw new Error('No example to check');
    // Assertions
    expect(exampleIsCollected(example.recordId)).toBeTruthy();
  });
  it('returns false if example is not collected', async () => {
    // Initial Render
    const { exampleIsCollected } = await renderHookSuccessfully();

    // Assertions
    expect(exampleIsCollected(-1)).toBeFalsy();
  });
});

describe('exampleIsPending', () => {
  beforeEach(() => {
    overrideAuthAndAppUser({
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isAdmin: false,
      isCoach: false,
      isStudent: true,
      isLimited: false,
    });
  });
  it('returns true if example is pending', async () => {
    // Initial Render
    const { result } = renderHook(useStudentFlashcards, {
      wrapper: MockAllProviders,
    });
    await waitFor(() => {
      expect(result.current.flashcardDataQuery.isSuccess).toBeTruthy();
      expect(result.current.addFlashcardMutation).toBeDefined();
      expect(result.current.exampleIsPending).toBeDefined();
    });
    // Setup
    const flashcardDataQuery = result.current.flashcardDataQuery;

    const unknownExample = examples.find(
      (example) =>
        !flashcardDataQuery.data?.examples.some(
          (flashcard) => flashcard.recordId === example.recordId,
        ),
    );
    if (!unknownExample) throw new Error('No unknown examples to add');
    // Add a flashcard
    result.current.addFlashcardMutation.mutate(unknownExample);
    // Assertions
    await waitFor(() => {
      expect(
        result.current.exampleIsPending(unknownExample.recordId),
      ).toBeTruthy();
    });
    await waitFor(() => {
      expect(
        result.current.exampleIsCollected(unknownExample.recordId),
      ).toBeTruthy();
    });
  });
  it('returns false if example is not pending', async () => {
    // Initial Render
    const { flashcardDataQuery, exampleIsPending } =
      await renderHookSuccessfully();

    const example = flashcardDataQuery.data?.examples[0];
    if (!example) throw new Error('No example to check');
    // Assertions
    expect(exampleIsPending(example.recordId)).toBeFalsy();
  });
});
