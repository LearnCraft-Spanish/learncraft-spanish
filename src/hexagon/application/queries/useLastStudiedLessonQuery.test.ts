import {
  mockLastStudiedLessonAdapter,
  seedMockLastStudiedLesson,
} from '@application/adapters/lastStudiedLessonAdapter.mock';
import { useLastStudiedLessonQuery } from '@application/queries/useLastStudiedLessonQuery';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { describe, expect, it } from 'vitest';

const studentLcsp = getAppUserFromEmail('student-lcsp@fake.not')!;
const studentEmail = studentLcsp.emailAddress;
const limitedAuth = getAuthUserFromEmail('limited@fake.not')!;

function loginAsStudent({ isOwnUser = true }: { isOwnUser?: boolean } = {}) {
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail('student-lcsp@fake.not')!,
      isAuthenticated: true,
      isStudent: true,
      isCoach: false,
      isAdmin: false,
      isLimited: false,
    },
    {
      appUser: studentLcsp,
      isOwnUser,
    },
  );
}

function loginAsFreeUser() {
  overrideAuthAndAppUser(
    {
      authUser: limitedAuth,
      isAuthenticated: true,
      isStudent: false,
      isCoach: false,
      isAdmin: false,
      isLimited: true,
    },
    {
      appUser: null,
      isOwnUser: true,
    },
  );
}

function renderQuery() {
  return renderHook(() => useLastStudiedLessonQuery(), {
    wrapper: TestQueryClientProvider,
  });
}

describe('useLastStudiedLessonQuery', () => {
  describe('reading', () => {
    it('returns null when nothing has been stored', async () => {
      loginAsStudent();

      const { result } = renderQuery();

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.lastStudiedLesson).toBe(null);
    });

    it('returns the stored record for the active user', async () => {
      loginAsStudent();
      await seedMockLastStudiedLesson({
        email: studentEmail,
        courseId: 2,
        lessonNumber: 42,
        updatedAt: '2026-08-13T00:00:00.000Z',
      });

      const { result } = renderQuery();

      await waitFor(() =>
        expect(result.current.lastStudiedLesson?.lessonNumber).toBe(42),
      );
    });

    it('returns null when the stored record belongs to another user', async () => {
      loginAsStudent();
      await seedMockLastStudiedLesson({
        email: 'student-admin@fake.not',
        courseId: 2,
        lessonNumber: 42,
        updatedAt: '2026-08-13T00:00:00.000Z',
      });

      const { result } = renderQuery();

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.lastStudiedLesson).toBe(null);
    });

    it('returns the stored record for a free user with no app data', async () => {
      loginAsFreeUser();
      await seedMockLastStudiedLesson({
        email: limitedAuth.email,
        courseId: 2,
        lessonNumber: 8,
        updatedAt: '2026-08-13T00:00:00.000Z',
      });

      const { result } = renderQuery();

      await waitFor(() =>
        expect(result.current.lastStudiedLesson?.lessonNumber).toBe(8),
      );
    });
  });

  describe('recording', () => {
    it('stores the lesson for the active user and exposes it on refetch', async () => {
      loginAsStudent();

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.recordLastStudiedLesson({
          courseId: 2,
          lessonNumber: 31,
        });
      });

      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledWith({
        email: studentEmail,
        courseId: 2,
        lessonNumber: 31,
      });
      await waitFor(() =>
        expect(result.current.lastStudiedLesson?.lessonNumber).toBe(31),
      );
      expect(result.current.lastStudiedLesson).not.toHaveProperty('email');
      expect(result.current.lastStudiedLesson?.emailHash).toMatch(
        /^[a-f0-9]{64}$/,
      );
    });

    it('stores the lesson for a free user with no app data', async () => {
      loginAsFreeUser();

      const { result } = renderQuery();
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.recordLastStudiedLesson({
          courseId: 2,
          lessonNumber: 4,
        });
      });

      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledWith({
        email: limitedAuth.email,
        courseId: 2,
        lessonNumber: 4,
      });
      await waitFor(() =>
        expect(result.current.lastStudiedLesson?.lessonNumber).toBe(4),
      );
    });

    it('does not record when a coach is viewing another student', async () => {
      loginAsStudent({ isOwnUser: false });

      const { result } = renderQuery();

      await act(async () => {
        await result.current.recordLastStudiedLesson({
          courseId: 2,
          lessonNumber: 31,
        });
      });

      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).not.toHaveBeenCalled();
    });
  });
});
