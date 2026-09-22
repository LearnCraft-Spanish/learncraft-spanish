import type { TestUserEmail } from 'mocks/data/serverlike/userTable';
import type { ReactNode } from 'react';
import {
  resetMockLastStudiedLessonAdapter,
  seedMockLastStudiedLesson,
} from '@application/adapters/lastStudiedLessonAdapter.mock';
import { overrideMockActiveStudent } from '@application/coordinators/hooks/useActiveStudent.mock';
import { useHomeScreen } from '@application/useCases/useHomeScreen';
import { DEFAULT_HOME_PRESET } from '@domain/homePresets/homePresets';
import { renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it } from 'vitest';

const LCSP_COURSE_ID = 2;

// recordId 8, courseId 2, lessonNumber 10 → Official Quiz preset
const lcspEarlyStudent = getAppUserFromEmail('student-no-flashcards@fake.not')!;
// courseId 5 → no matching preset → default
const otherCourseStudent = getAppUserFromEmail('student-ser-estar@fake.not')!;

function loginAs(email: TestUserEmail) {
  const appUser = getAppUserFromEmail(email)!;
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail(email)!,
      isAuthenticated: true,
      isStudent: true,
      isCoach: false,
      isAdmin: false,
      isLimited: false,
    },
    {
      appUser,
      isOwnUser: true,
      isLoading: false,
      error: null,
    },
  );
}

function wrapper({ children }: { children: ReactNode }) {
  return <TestQueryClientProvider>{children}</TestQueryClientProvider>;
}

function renderHomeScreen() {
  return renderHook(() => useHomeScreen(), { wrapper });
}

describe('useHomeScreen', () => {
  beforeEach(async () => {
    resetMockLastStudiedLessonAdapter();
    await seedMockLastStudiedLesson(null);
  });

  it('reports loading while the app user is still loading', () => {
    loginAs('student-no-flashcards@fake.not');
    overrideMockActiveStudent({ isLoading: true });

    const { result } = renderHomeScreen();

    expect(result.current.isLoading).toBe(true);
  });

  it('selects the Official Quiz preset from appUser lesson progress', async () => {
    loginAs('student-no-flashcards@fake.not');

    const { result } = renderHomeScreen();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.cta.headline).toBe('Official Quiz');
    expect(result.current.cta.path).toBe('/officialquizzes');
    expect(result.current.entries.map((entry) => entry.path)).toEqual([
      '/myflashcards',
      '/customquiz',
      '/flashcardfinder',
    ]);
  });

  it('selects the Custom Quiz preset for advanced LCSP progress', async () => {
    loginAs('student-lcsp@fake.not');

    const { result } = renderHomeScreen();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.cta.headline).toBe('Build a Custom Quiz');
    expect(result.current.cta.path).toBe('/customquiz');
  });

  it('prefers the stored last-studied lesson over appUser progress', async () => {
    loginAs('student-no-flashcards@fake.not');
    await seedMockLastStudiedLesson({
      email: lcspEarlyStudent.emailAddress,
      courseId: LCSP_COURSE_ID,
      lessonNumber: 15,
      updatedAt: '2026-08-13T00:00:00.000Z',
    });

    const { result } = renderHomeScreen();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.cta.headline).toBe('Quiz my flashcards');
    expect(result.current.cta.path).toBe('/myflashcards');
    expect(result.current.entries.map((entry) => entry.path)).toEqual([
      '/officialquizzes',
      '/manage-flashcards',
      '/flashcardfinder',
    ]);
  });

  it('falls to the default for a non-student', async () => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('limited@fake.not')!,
        isAuthenticated: true,
        isStudent: false,
        isLimited: true,
      },
      {
        appUser: getAppUserFromEmail('limited@fake.not'),
        isOwnUser: true,
      },
    );

    const { result } = renderHomeScreen();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.cta).toEqual(DEFAULT_HOME_PRESET.cta);
    expect(result.current.entries).toEqual(DEFAULT_HOME_PRESET.entries);
  });

  it('falls to the default for a course with no configured presets', async () => {
    loginAs('student-ser-estar@fake.not');

    const { result } = renderHomeScreen();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.cta).toEqual(DEFAULT_HOME_PRESET.cta);
    expect(otherCourseStudent.courseId).not.toBe(LCSP_COURSE_ID);
  });

  it('falls to the default preset content when the app user fails to load', async () => {
    loginAs('student-lcsp@fake.not');
    overrideMockActiveStudent({
      appUser: null,
      isLoading: false,
      error: new Error('failed to load app user'),
      isOwnUser: true,
    });

    const { result } = renderHomeScreen();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe('failed to load app user');
    expect(result.current.cta).toEqual(DEFAULT_HOME_PRESET.cta);
    expect(result.current.entries).toEqual(DEFAULT_HOME_PRESET.entries);
    expect(result.current.cta.headline).toBe('Quiz my flashcards');
  });
});
