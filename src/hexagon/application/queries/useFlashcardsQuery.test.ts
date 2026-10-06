import type {
  AppUser,
  ExampleWithVocabulary,
  Flashcard,
} from '@learncraft-spanish/shared';
import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import {
  mockFlashcardAdapter,
  overrideMockFlashcardAdapter,
} from '@application/adapters/flashcardAdapter.mock';
import { overrideMockActiveStudent } from '@application/coordinators/hooks/useActiveStudent.mock';
import { useFlashcardsQuery } from '@application/queries/useFlashcardsQuery';
import { toISODate } from '@domain/functions/dateUtils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockAppUser } from '@testing/factories/appUserFactories';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { testQueryClient } from '@testing/utils/testQueryClient';
import { toast } from 'react-toastify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const STUDENT_ID = 42;

const tempIds = vi.hoisted(() => ({ next: -1 }));

vi.mock('@application/coordinators/hooks/useTempId', () => ({
  useTempId: () => ({
    getNextTempId: () => tempIds.next--,
  }),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function appUser(role: AppUser['studentRole'] = 'student'): AppUser {
  return createMockAppUser({
    recordId: STUDENT_ID,
    studentRole: role,
  });
}

function signIn({
  isAdmin = false,
  isCoach = false,
  isStudent = false,
  isOwnUser = false,
  user = appUser(),
}: {
  isAdmin?: boolean;
  isCoach?: boolean;
  isStudent?: boolean;
  isOwnUser?: boolean;
  user?: AppUser | null;
} = {}) {
  overrideMockAuthAdapter({
    isAdmin,
    isCoach,
    isStudent,
    isLimited: !isAdmin && !isCoach && !isStudent,
    isAuthenticated: true,
  });
  overrideMockActiveStudent({
    appUser: user,
    isOwnUser,
    isLoading: false,
    error: null,
  });
}

function signInAsOwnStudent() {
  signIn({ isStudent: true, isOwnUser: true });
}

function signInAsCoach() {
  signIn({ isCoach: true, isOwnUser: false });
}

function signInAsAdmin() {
  signIn({ isAdmin: true, isOwnUser: false });
}

function makeExample(id: number): ExampleWithVocabulary {
  const [example] = createMockExampleWithVocabularyList(1);
  return { ...example, id };
}

function makeFlashcard({
  id,
  example = makeExample(id),
  custom = false,
  interval = 1,
}: {
  id: number;
  example?: ExampleWithVocabulary;
  custom?: boolean;
  interval?: number | null;
}): Flashcard {
  const card = createMockFlashcard({
    id,
    userId: STUDENT_ID,
    custom,
  });
  return {
    ...card,
    id,
    userId: STUDENT_ID,
    custom,
    interval,
    example,
  };
}

function seedFlashcards(cards: Flashcard[], userId = STUDENT_ID) {
  testQueryClient.setQueryData(['flashcards', userId], cards);
}

function seedPending(ids: number[], userId = STUDENT_ID) {
  testQueryClient.setQueryData(['flashcards', 'pendingDeletes', userId], ids);
}

/** Later refetches stay unresolved so optimistic cache writes can be asserted. */
function holdRefetches() {
  const waiting: Array<(cards: Flashcard[]) => void> = [];
  const hang = () =>
    new Promise<Flashcard[]>((resolve) => {
      waiting.push(resolve);
    });
  return {
    getMyFlashcards: hang,
    getStudentFlashcards: (_studentId: number) => hang(),
    release: (cards: Flashcard[] = []) => {
      waiting.splice(0).forEach((resolve) => resolve(cards));
    },
  };
}

function hold<T>() {
  let resolveHold: (value: T) => void = () => {};
  let rejectHold: (reason?: unknown) => void = () => {};
  const promise = new Promise<T>((resolve, reject) => {
    resolveHold = resolve;
    rejectHold = reject;
  });
  return { promise, resolve: resolveHold, reject: rejectHold };
}

function renderQuery() {
  return renderHook(() => useFlashcardsQuery(), {
    wrapper: TestQueryClientProvider,
  });
}

function expectInvalidated() {
  expect(testQueryClient.invalidateQueries).toHaveBeenCalledWith({
    queryKey: ['flashcards', STUDENT_ID],
  });
  expect(testQueryClient.invalidateQueries).toHaveBeenCalledWith({
    queryKey: ['flashcardData'],
  });
}

function expectTempCards(
  cards: Flashcard[] | undefined,
  examples: ExampleWithVocabulary[],
) {
  const temps = (cards ?? []).filter((card) => card.id < 0);
  expect(temps.map((card) => card.id)).toEqual(
    examples.map((_, index) => -1 - index),
  );
  temps.forEach((temp, index) => {
    expect(temp.example).toBe(examples[index]);
    expect(temp.custom).toBe(false);
    expect(temp.interval).toBe(1);
    expect(temp.userId).toBe(STUDENT_ID);
    expect(temp.lastReviewed).toBe(toISODate());
    expect(temp.nextReview).toBe(toISODate());
    expect(temp.dateCreated).toEqual(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
    );
  });
}

describe('useFlashcardsQuery', () => {
  beforeEach(() => {
    tempIds.next = -1;
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(testQueryClient, 'invalidateQueries');
    vi.spyOn(testQueryClient, 'cancelQueries');
  });

  describe('who can read flashcards', () => {
    it('loads the signed-in student through their own flashcards', async () => {
      const mine = [makeFlashcard({ id: 1 }), makeFlashcard({ id: 2 })];
      const someoneElses = [makeFlashcard({ id: 9 })];
      signInAsOwnStudent();
      overrideMockFlashcardAdapter({
        getMyFlashcards: async () => mine,
        getStudentFlashcards: async () => someoneElses,
      });

      const { result } = renderQuery();

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.flashcards).toEqual(mine);
      expect(result.current.error).toBeNull();
      expect(result.current.isFetchingFlashcards).toBe(false);
      expect(mockFlashcardAdapter.getMyFlashcards).toHaveBeenCalled();
      expect(mockFlashcardAdapter.getStudentFlashcards).not.toHaveBeenCalled();
    });

    it('keeps the own-student path when that student is also staff', async () => {
      const mine = [makeFlashcard({ id: 1 })];
      signIn({
        isStudent: true,
        isCoach: true,
        isAdmin: true,
        isOwnUser: true,
      });
      overrideMockFlashcardAdapter({
        getMyFlashcards: async () => mine,
        getStudentFlashcards: async () => [makeFlashcard({ id: 9 })],
      });

      const { result } = renderQuery();

      await waitFor(() => expect(result.current.flashcards).toEqual(mine));
      expect(mockFlashcardAdapter.getStudentFlashcards).not.toHaveBeenCalled();
    });

    it('loads a coach viewing a student through that student id', async () => {
      const studentCards = [makeFlashcard({ id: 4 })];
      signInAsCoach();
      overrideMockFlashcardAdapter({
        getMyFlashcards: async () => [makeFlashcard({ id: 1 })],
        getStudentFlashcards: async () => studentCards,
      });

      const { result } = renderQuery();

      await waitFor(() =>
        expect(result.current.flashcards).toEqual(studentCards),
      );
      expect(mockFlashcardAdapter.getStudentFlashcards).toHaveBeenCalledWith(
        STUDENT_ID,
      );
      expect(mockFlashcardAdapter.getMyFlashcards).not.toHaveBeenCalled();
    });

    it('loads an admin viewing a student through that student id', async () => {
      const studentCards = [makeFlashcard({ id: 5 })];
      signInAsAdmin();
      overrideMockFlashcardAdapter({
        getMyFlashcards: async () => [makeFlashcard({ id: 1 })],
        getStudentFlashcards: async () => studentCards,
      });

      const { result } = renderQuery();

      await waitFor(() =>
        expect(result.current.flashcards).toEqual(studentCards),
      );
      expect(mockFlashcardAdapter.getStudentFlashcards).toHaveBeenCalledWith(
        STUDENT_ID,
      );
      expect(mockFlashcardAdapter.getMyFlashcards).not.toHaveBeenCalled();
    });

    it('returns an empty list when a student opens someone else', async () => {
      signIn({ isStudent: true, isOwnUser: false });
      overrideMockFlashcardAdapter({
        getMyFlashcards: async () => [makeFlashcard({ id: 1 })],
        getStudentFlashcards: async () => [makeFlashcard({ id: 2 })],
      });

      const { result } = renderQuery();

      await waitFor(() => expect(result.current.flashcards).toEqual([]));
      expect(console.error).toHaveBeenCalledWith('No access to flashcards');
      expect(mockFlashcardAdapter.getMyFlashcards).not.toHaveBeenCalled();
      expect(mockFlashcardAdapter.getStudentFlashcards).not.toHaveBeenCalled();
    });

    it('returns an empty list when the active user is not a student record', async () => {
      signIn({
        isAdmin: true,
        isOwnUser: true,
        user: appUser('limited'),
      });
      overrideMockFlashcardAdapter({
        getMyFlashcards: async () => [makeFlashcard({ id: 1 })],
        getStudentFlashcards: async () => [makeFlashcard({ id: 2 })],
      });

      const { result } = renderQuery();

      await waitFor(() => expect(result.current.flashcards).toEqual([]));
      expect(console.error).toHaveBeenCalledWith('No access to flashcards');
      expect(mockFlashcardAdapter.getMyFlashcards).not.toHaveBeenCalled();
      expect(mockFlashcardAdapter.getStudentFlashcards).not.toHaveBeenCalled();
    });

    it('does not fetch when the viewer has no student, coach, or admin access', async () => {
      signIn({ user: appUser('student') });
      overrideMockFlashcardAdapter({
        getMyFlashcards: async () => [makeFlashcard({ id: 1 })],
        getStudentFlashcards: async () => [makeFlashcard({ id: 2 })],
      });

      const { result } = renderQuery();

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.flashcards).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(mockFlashcardAdapter.getMyFlashcards).not.toHaveBeenCalled();
      expect(mockFlashcardAdapter.getStudentFlashcards).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalledWith('No access to flashcards');
    });

    it('does not fetch when there is no active user', async () => {
      signIn({ isStudent: true, isOwnUser: true, user: null });

      const { result } = renderQuery();

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.flashcards).toBeUndefined();
      expect(mockFlashcardAdapter.getMyFlashcards).not.toHaveBeenCalled();
      expect(mockFlashcardAdapter.getStudentFlashcards).not.toHaveBeenCalled();
    });

    it('exposes a fetch failure', async () => {
      signInAsOwnStudent();
      overrideMockFlashcardAdapter({
        getMyFlashcards: async () => {
          throw new Error('flashcards unavailable');
        },
      });

      const { result } = renderQuery();

      await waitFor(() => expect(result.current.error).not.toBeNull());
      expect(result.current.error?.message).toBe('flashcards unavailable');
      expect(result.current.flashcards).toBeUndefined();
    });
  });

  describe('pending deletes', () => {
    it('reads pending example ids for the active student only', async () => {
      signInAsOwnStudent();
      seedPending([7, 8]);
      seedPending([99], 999);
      overrideMockFlashcardAdapter({
        getMyFlashcards: async () => [],
      });

      const { result } = renderQuery();

      await waitFor(() =>
        expect(result.current.pendingDeleteExampleIds).toEqual([7, 8]),
      );
    });
  });

  describe('createFlashcards', () => {
    it('optimistically adds the signed-in student cards, then keeps the server cards', async () => {
      const existing = [makeFlashcard({ id: 1 }), makeFlashcard({ id: 2 })];
      const examples = [makeExample(201), makeExample(202)];
      const created = examples.map((example, index) =>
        makeFlashcard({ id: 300 + index, example }),
      );
      const fetches = holdRefetches();
      const creating = hold<Flashcard[]>();
      signInAsOwnStudent();
      seedFlashcards(existing);
      overrideMockFlashcardAdapter({
        getMyFlashcards: fetches.getMyFlashcards,
        createMyStudentFlashcards: () => creating.promise,
      });

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.flashcards).toEqual(existing));

      let createPromise: Promise<Flashcard[]> = Promise.resolve([]);
      act(() => {
        createPromise = result.current.createFlashcards(examples);
      });

      await waitFor(() => {
        expect(result.current.flashcards?.some((card) => card.id < 0)).toBe(
          true,
        );
      });

      expect(result.current.flashcards?.slice(0, existing.length)).toEqual(
        existing,
      );
      expectTempCards(result.current.flashcards, examples);
      expect(testQueryClient.cancelQueries).toHaveBeenCalledWith({
        queryKey: ['flashcards', STUDENT_ID],
      });

      creating.resolve(created);
      await act(async () => {
        await expect(createPromise).resolves.toBe(created);
      });

      await waitFor(() => {
        expect(result.current.flashcards).toEqual([...existing, ...created]);
      });
      expect(
        mockFlashcardAdapter.createMyStudentFlashcards,
      ).toHaveBeenCalledWith({ examples });
      expect(
        mockFlashcardAdapter.createStudentFlashcards,
      ).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
      expectInvalidated();
      fetches.release(existing);
    });

    it('starts from the temporary cards when the signed-in student has no cache yet', async () => {
      const examples = [makeExample(201)];
      const created = [makeFlashcard({ id: 300, example: examples[0] })];
      const fetches = holdRefetches();
      const creating = hold<Flashcard[]>();
      signInAsOwnStudent();
      overrideMockFlashcardAdapter({
        getMyFlashcards: fetches.getMyFlashcards,
        createMyStudentFlashcards: () => creating.promise,
      });

      const { result } = renderQuery();
      expect(result.current.flashcards).toBeUndefined();

      let createPromise: Promise<Flashcard[]> = Promise.resolve([]);
      act(() => {
        createPromise = result.current.createFlashcards(examples);
      });

      await waitFor(() => {
        expect(result.current.flashcards?.every((card) => card.id < 0)).toBe(
          true,
        );
      });
      expectTempCards(result.current.flashcards, examples);

      creating.resolve(created);
      await act(async () => {
        await createPromise;
      });

      await waitFor(() => {
        expect(result.current.flashcards).toEqual(created);
      });
      fetches.release([]);
    });

    it('removes the temporary cards and toasts when creating for the signed-in student fails', async () => {
      const existing = [makeFlashcard({ id: 1 })];
      const examples = [makeExample(201)];
      const fetches = holdRefetches();
      const creating = hold<Flashcard[]>();
      signInAsOwnStudent();
      seedFlashcards(existing);
      overrideMockFlashcardAdapter({
        getMyFlashcards: fetches.getMyFlashcards,
        createMyStudentFlashcards: () => creating.promise,
      });

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.flashcards).toEqual(existing));

      let createPromise: Promise<Flashcard[]> = Promise.resolve([]);
      act(() => {
        createPromise = result.current.createFlashcards(examples);
      });
      await waitFor(() => {
        expect(result.current.flashcards?.some((card) => card.id < 0)).toBe(
          true,
        );
      });

      creating.reject(new Error('create failed'));
      await act(async () => {
        await expect(createPromise).rejects.toThrow('create failed');
      });

      await waitFor(() => {
        expect(result.current.flashcards).toEqual(existing);
      });
      expect(console.error).toHaveBeenCalledWith(
        'Failed to create flashcards',
        expect.any(Error),
      );
      expect(toast.error).toHaveBeenCalledWith('Failed to create flashcards');
      expectInvalidated();
      fetches.release(existing);
    });

    it('creates for a student the coach is viewing, using that student id', async () => {
      const existing = [makeFlashcard({ id: 1 })];
      const examples = [makeExample(201), makeExample(202)];
      const created = examples.map((example, index) =>
        makeFlashcard({ id: 300 + index, example }),
      );
      const fetches = holdRefetches();
      const creating = hold<Flashcard[]>();
      signInAsCoach();
      seedFlashcards(existing);
      overrideMockFlashcardAdapter({
        getStudentFlashcards: fetches.getStudentFlashcards,
        createStudentFlashcards: () => creating.promise,
      });

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.flashcards).toEqual(existing));

      let createPromise: Promise<Flashcard[]> = Promise.resolve([]);
      act(() => {
        createPromise = result.current.createFlashcards(examples);
      });

      await waitFor(() => {
        expect(result.current.flashcards?.some((card) => card.id < 0)).toBe(
          true,
        );
      });
      expect(result.current.flashcards?.slice(0, existing.length)).toEqual(
        existing,
      );
      expectTempCards(result.current.flashcards, examples);

      creating.resolve(created);
      await act(async () => {
        await expect(createPromise).resolves.toBe(created);
      });

      await waitFor(() => {
        expect(result.current.flashcards).toEqual([...existing, ...created]);
      });
      expect(mockFlashcardAdapter.createStudentFlashcards).toHaveBeenCalledWith(
        { studentId: STUDENT_ID, examples },
      );
      expect(
        mockFlashcardAdapter.createMyStudentFlashcards,
      ).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
      expectInvalidated();
      fetches.release(existing);
    });

    it('rolls back a coach create that fails', async () => {
      const existing = [makeFlashcard({ id: 1 })];
      const examples = [makeExample(201)];
      const fetches = holdRefetches();
      const creating = hold<Flashcard[]>();
      signInAsCoach();
      seedFlashcards(existing);
      overrideMockFlashcardAdapter({
        getStudentFlashcards: fetches.getStudentFlashcards,
        createStudentFlashcards: () => creating.promise,
      });

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.flashcards).toEqual(existing));

      let createPromise: Promise<Flashcard[]> = Promise.resolve([]);
      act(() => {
        createPromise = result.current.createFlashcards(examples);
      });
      await waitFor(() => {
        expect(result.current.flashcards?.some((card) => card.id < 0)).toBe(
          true,
        );
      });

      creating.reject(new Error('create failed'));
      await act(async () => {
        await expect(createPromise).rejects.toThrow('create failed');
      });

      await waitFor(() => {
        expect(result.current.flashcards).toEqual(existing);
      });
      expect(toast.error).toHaveBeenCalledWith('Failed to create flashcards');
      expectInvalidated();
      fetches.release(existing);
    });

    it('creates for a student an admin is viewing', async () => {
      const examples = [makeExample(201)];
      const created = [makeFlashcard({ id: 300, example: examples[0] })];
      signInAsAdmin();
      seedFlashcards([]);
      const fetches = holdRefetches();
      overrideMockFlashcardAdapter({
        getStudentFlashcards: fetches.getStudentFlashcards,
        createStudentFlashcards: async () => created,
      });

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.flashcards).toEqual([]));

      await act(async () => {
        await expect(
          result.current.createFlashcards(examples),
        ).resolves.toEqual(created);
      });

      expect(mockFlashcardAdapter.createStudentFlashcards).toHaveBeenCalledWith(
        { studentId: STUDENT_ID, examples },
      );
      expect(
        mockFlashcardAdapter.createMyStudentFlashcards,
      ).not.toHaveBeenCalled();
      fetches.release([]);
    });

    it('rejects when the viewer cannot create flashcards', async () => {
      signIn({ isStudent: true, isOwnUser: false });
      const { result } = renderQuery();

      await expect(result.current.createFlashcards([])).rejects.toThrow(
        'No access to create flashcards',
      );

      expect(console.error).toHaveBeenCalledWith(
        'No access to create flashcards',
      );
      expect(toast.error).not.toHaveBeenCalled();
      expect(
        mockFlashcardAdapter.createMyStudentFlashcards,
      ).not.toHaveBeenCalled();
      expect(
        mockFlashcardAdapter.createStudentFlashcards,
      ).not.toHaveBeenCalled();
    });
  });

  describe('updateFlashcards', () => {
    it('replaces the signed-in student cards that came back from the server', async () => {
      const kept = makeFlashcard({ id: 2, example: makeExample(22) });
      const original = makeFlashcard({ id: 1, example: makeExample(11) });
      const updated = makeFlashcard({
        id: 1,
        example: original.example,
        interval: 6,
      });
      const fetches = holdRefetches();
      signInAsOwnStudent();
      seedFlashcards([original, kept]);
      overrideMockFlashcardAdapter({
        getMyFlashcards: fetches.getMyFlashcards,
        updateMyStudentFlashcards: async () => [updated],
      });

      const { result } = renderQuery();
      await waitFor(() =>
        expect(result.current.flashcards).toEqual([original, kept]),
      );

      const updates = [
        {
          flashcardId: original.id,
          interval: 6,
          lastReviewedDate: '2026-06-01',
        },
      ];

      await act(async () => {
        await expect(result.current.updateFlashcards(updates)).resolves.toEqual(
          [updated],
        );
      });

      await waitFor(() => {
        expect(result.current.flashcards).toEqual([updated, kept]);
      });
      expect(
        mockFlashcardAdapter.updateMyStudentFlashcards,
      ).toHaveBeenCalledWith({ updates });
      expectInvalidated();
      fetches.release([original, kept]);
    });

    it('stores the server cards when the signed-in student has no cache yet', async () => {
      const updated = [makeFlashcard({ id: 1 })];
      const fetches = holdRefetches();
      signInAsOwnStudent();
      overrideMockFlashcardAdapter({
        getMyFlashcards: fetches.getMyFlashcards,
        updateMyStudentFlashcards: async () => updated,
      });

      const { result } = renderQuery();

      await act(async () => {
        await result.current.updateFlashcards([
          {
            flashcardId: 1,
            interval: 2,
            lastReviewedDate: '2026-06-01',
          },
        ]);
      });

      await waitFor(() => {
        expect(result.current.flashcards).toEqual(updated);
      });
      fetches.release([]);
    });

    it('rejects a coach update even though the coach can read the student', async () => {
      signInAsCoach();
      seedFlashcards([makeFlashcard({ id: 1 })]);
      const fetches = holdRefetches();
      overrideMockFlashcardAdapter({
        getStudentFlashcards: fetches.getStudentFlashcards,
      });

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.flashcards).toHaveLength(1));

      await expect(
        result.current.updateFlashcards([
          {
            flashcardId: 1,
            interval: 2,
            lastReviewedDate: '2026-06-01',
          },
        ]),
      ).rejects.toThrow('No access to update flashcards');

      expect(console.error).toHaveBeenCalledWith(
        'No access to update flashcards',
      );
      expect(
        mockFlashcardAdapter.updateMyStudentFlashcards,
      ).not.toHaveBeenCalled();
      fetches.release([]);
    });

    it('rejects an admin update of a student', async () => {
      signInAsAdmin();
      const { result } = renderQuery();

      await expect(result.current.updateFlashcards([])).rejects.toThrow(
        'No access to update flashcards',
      );
      expect(
        mockFlashcardAdapter.updateMyStudentFlashcards,
      ).not.toHaveBeenCalled();
    });
  });

  describe('deleteFlashcards', () => {
    const kept = () => makeFlashcard({ id: 1, example: makeExample(50) });
    const removed = () => makeFlashcard({ id: 2, example: makeExample(60) });

    it('hides the signed-in student cards and clears those pending ids after delete', async () => {
      const keep = kept();
      const remove = removed();
      const fetches = holdRefetches();
      const deleting = hold<number>();
      signInAsOwnStudent();
      seedFlashcards([keep, remove]);
      seedPending([7]);
      overrideMockFlashcardAdapter({
        getMyFlashcards: fetches.getMyFlashcards,
        deleteMyStudentFlashcards: () => deleting.promise,
      });

      const { result } = renderQuery();
      await waitFor(() =>
        expect(result.current.flashcards).toEqual([keep, remove]),
      );
      await waitFor(() =>
        expect(result.current.pendingDeleteExampleIds).toEqual([7]),
      );

      let deletePromise: Promise<number> = Promise.resolve(0);
      act(() => {
        deletePromise = result.current.deleteFlashcards([remove.example.id]);
      });

      await waitFor(() =>
        expect(result.current.pendingDeleteExampleIds).toEqual([
          7,
          remove.example.id,
        ]),
      );
      expect(result.current.flashcards).toEqual([keep]);
      expect(testQueryClient.cancelQueries).toHaveBeenCalledWith({
        queryKey: ['flashcards', STUDENT_ID],
      });

      deleting.resolve(1);
      await act(async () => {
        await expect(deletePromise).resolves.toBe(1);
      });

      await waitFor(() => {
        expect(result.current.flashcards).toEqual([keep]);
        expect(result.current.pendingDeleteExampleIds).toEqual([7]);
      });
      expect(
        mockFlashcardAdapter.deleteMyStudentFlashcards,
      ).toHaveBeenCalledWith({ exampleIds: [remove.example.id] });
      expect(
        mockFlashcardAdapter.deleteStudentFlashcards,
      ).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
      expectInvalidated();
      fetches.release([keep]);
    });

    it('toasts when only some of the signed-in student cards were deleted', async () => {
      const keep = kept();
      const removeA = removed();
      const removeB = makeFlashcard({ id: 3, example: makeExample(70) });
      const fetches = holdRefetches();
      signInAsOwnStudent();
      seedFlashcards([keep, removeA, removeB]);
      seedPending([]);
      overrideMockFlashcardAdapter({
        getMyFlashcards: fetches.getMyFlashcards,
        deleteMyStudentFlashcards: async () => 1,
      });

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.flashcards).toHaveLength(3));

      await act(async () => {
        await result.current.deleteFlashcards([
          removeA.example.id,
          removeB.example.id,
        ]);
      });

      await waitFor(() => {
        expect(result.current.flashcards?.map((card) => card.id)).toEqual([
          keep.id,
        ]);
      });

      expect(result.current.flashcards).toEqual([keep]);
      expect(result.current.pendingDeleteExampleIds).toEqual([]);
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to delete some flashcards. 1 of 2 flashcards deleted.',
      );
      fetches.release([keep]);
    });

    it('puts the signed-in student cards back when delete fails', async () => {
      const keep = kept();
      const remove = removed();
      const fetches = holdRefetches();
      const deleting = hold<number>();
      signInAsOwnStudent();
      seedFlashcards([remove, keep]);
      seedPending([7]);
      overrideMockFlashcardAdapter({
        getMyFlashcards: fetches.getMyFlashcards,
        deleteMyStudentFlashcards: () => deleting.promise,
      });

      const { result } = renderQuery();
      await waitFor(() =>
        expect(result.current.flashcards).toEqual([remove, keep]),
      );

      let deletePromise: Promise<number> = Promise.resolve(0);
      act(() => {
        deletePromise = result.current.deleteFlashcards([remove.example.id]);
      });
      await waitFor(() => expect(result.current.flashcards).toEqual([keep]));
      expect(result.current.pendingDeleteExampleIds).toEqual([
        7,
        remove.example.id,
      ]);

      deleting.reject(new Error('delete failed'));
      await act(async () => {
        await expect(deletePromise).rejects.toThrow('delete failed');
      });

      await waitFor(() => {
        expect(result.current.flashcards).toEqual([keep, remove]);
        expect(result.current.pendingDeleteExampleIds).toEqual([7]);
      });
      expect(console.error).toHaveBeenCalledWith(
        'Failed to delete flashcards',
        expect.any(Error),
      );
      expect(toast.error).toHaveBeenCalledWith('Failed to delete flashcards');
      expectInvalidated();
      fetches.release([keep, remove]);
    });

    it('refuses to delete before the signed-in student cards have loaded', async () => {
      const fetches = holdRefetches();
      signInAsOwnStudent();
      overrideMockFlashcardAdapter({
        getMyFlashcards: fetches.getMyFlashcards,
      });

      const { result } = renderQuery();
      expect(result.current.flashcards).toBeUndefined();

      await expect(result.current.deleteFlashcards([60])).rejects.toThrow(
        'Flashcards not found',
      );

      expect(toast.error).toHaveBeenCalledWith('Failed to delete flashcards');
      expect(
        mockFlashcardAdapter.deleteMyStudentFlashcards,
      ).not.toHaveBeenCalled();
      fetches.release([]);
    });

    it('deletes a coach-viewed student by student and example pairs', async () => {
      const keep = kept();
      const remove = removed();
      const fetches = holdRefetches();
      const deleting = hold<number>();
      signInAsCoach();
      seedFlashcards([keep, remove]);
      seedPending([7]);
      overrideMockFlashcardAdapter({
        getStudentFlashcards: fetches.getStudentFlashcards,
        deleteStudentFlashcards: () => deleting.promise,
      });

      const { result } = renderQuery();
      await waitFor(() =>
        expect(result.current.flashcards).toEqual([keep, remove]),
      );

      let deletePromise: Promise<number> = Promise.resolve(0);
      act(() => {
        deletePromise = result.current.deleteFlashcards([remove.example.id]);
      });

      await waitFor(() => expect(result.current.flashcards).toEqual([keep]));
      expect(result.current.pendingDeleteExampleIds).toEqual([
        7,
        remove.example.id,
      ]);

      deleting.resolve(1);
      await act(async () => {
        await expect(deletePromise).resolves.toBe(1);
      });

      await waitFor(() => {
        expect(result.current.pendingDeleteExampleIds).toEqual([7]);
      });
      expect(mockFlashcardAdapter.deleteStudentFlashcards).toHaveBeenCalledWith(
        {
          pairs: [{ studentId: STUDENT_ID, exampleId: remove.example.id }],
        },
      );
      expect(
        mockFlashcardAdapter.deleteMyStudentFlashcards,
      ).not.toHaveBeenCalled();
      expectInvalidated();
      fetches.release([keep]);
    });

    it('toasts when a coach delete only removes some cards', async () => {
      const keep = kept();
      const removeA = removed();
      const removeB = makeFlashcard({ id: 3, example: makeExample(70) });
      const fetches = holdRefetches();
      signInAsCoach();
      seedFlashcards([keep, removeA, removeB]);
      seedPending([]);
      overrideMockFlashcardAdapter({
        getStudentFlashcards: fetches.getStudentFlashcards,
        deleteStudentFlashcards: async () => 1,
      });

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.flashcards).toHaveLength(3));

      await act(async () => {
        await result.current.deleteFlashcards([
          removeA.example.id,
          removeB.example.id,
        ]);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to delete some flashcards. 1 of 2 flashcards deleted.',
      );
      await waitFor(() => {
        expect(result.current.pendingDeleteExampleIds).toEqual([]);
        expect(result.current.flashcards).toEqual([keep]);
      });
      fetches.release([keep]);
    });

    it('puts a coach-viewed student cards back when delete fails', async () => {
      const keep = kept();
      const remove = removed();
      const fetches = holdRefetches();
      const deleting = hold<number>();
      signInAsCoach();
      seedFlashcards([remove, keep]);
      seedPending([7]);
      overrideMockFlashcardAdapter({
        getStudentFlashcards: fetches.getStudentFlashcards,
        deleteStudentFlashcards: () => deleting.promise,
      });

      const { result } = renderQuery();
      await waitFor(() =>
        expect(result.current.flashcards).toEqual([remove, keep]),
      );

      let deletePromise: Promise<number> = Promise.resolve(0);
      act(() => {
        deletePromise = result.current.deleteFlashcards([remove.example.id]);
      });
      await waitFor(() => expect(result.current.flashcards).toEqual([keep]));

      deleting.reject(new Error('delete failed'));
      await act(async () => {
        await expect(deletePromise).rejects.toThrow('delete failed');
      });

      await waitFor(() => {
        expect(result.current.flashcards).toEqual([keep, remove]);
        expect(result.current.pendingDeleteExampleIds).toEqual([7]);
      });
      expect(toast.error).toHaveBeenCalledWith('Failed to delete flashcards');
      fetches.release([keep, remove]);
    });

    it('deletes for an admin viewing a student', async () => {
      const remove = removed();
      const fetches = holdRefetches();
      signInAsAdmin();
      seedFlashcards([remove]);
      overrideMockFlashcardAdapter({
        getStudentFlashcards: fetches.getStudentFlashcards,
        deleteStudentFlashcards: async () => 1,
      });

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.flashcards).toEqual([remove]));

      await act(async () => {
        await result.current.deleteFlashcards([remove.example.id]);
      });

      expect(mockFlashcardAdapter.deleteStudentFlashcards).toHaveBeenCalledWith(
        {
          pairs: [{ studentId: STUDENT_ID, exampleId: remove.example.id }],
        },
      );
      fetches.release([]);
    });

    it('rejects when the viewer cannot delete flashcards', async () => {
      signIn({ isStudent: true, isOwnUser: false });
      const { result } = renderQuery();

      await expect(result.current.deleteFlashcards([60])).rejects.toThrow(
        'No access to delete flashcards',
      );

      expect(console.error).toHaveBeenCalledWith(
        'No access to delete flashcards',
      );
      expect(
        mockFlashcardAdapter.deleteMyStudentFlashcards,
      ).not.toHaveBeenCalled();
      expect(
        mockFlashcardAdapter.deleteStudentFlashcards,
      ).not.toHaveBeenCalled();
    });
  });
});
