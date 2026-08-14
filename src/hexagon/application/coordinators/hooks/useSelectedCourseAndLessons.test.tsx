import type { ReactNode } from 'react';
import { seedMockLastStudiedLesson } from '@application/adapters/lastStudiedLessonAdapter.mock';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { describe, expect, it, vi } from 'vitest';

// The global setup mocks this hook for consumers; this suite tests the real one
vi.unmock('@application/coordinators/hooks/useSelectedCourseAndLessons');

const LCSP_COURSE_ID = 2;

// recordId 8, courseId 2, lessonNumber 10
const student = getAppUserFromEmail('student-no-flashcards@fake.not')!;

function loginAsStudent() {
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail('student-no-flashcards@fake.not')!,
      isAuthenticated: true,
      isStudent: true,
      isCoach: false,
      isAdmin: false,
      isLimited: false,
    },
    {
      appUser: student,
      isOwnUser: true,
    },
  );
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <TestQueryClientProvider>
      <SelectedCourseAndLessonsProvider>
        {children}
      </SelectedCourseAndLessonsProvider>
    </TestQueryClientProvider>
  );
}

function renderCoordinator() {
  return renderHook(() => useSelectedCourseAndLessons(), { wrapper });
}

describe('useSelectedCourseAndLessons toLesson precedence', () => {
  it('falls back to the student course progress when nothing is stored', async () => {
    loginAsStudent();

    const { result } = renderCoordinator();

    await waitFor(() => expect(result.current.course?.id).toBe(LCSP_COURSE_ID));
    await waitFor(() =>
      expect(result.current.toLesson?.lessonNumber).toBe(student.lessonNumber),
    );
  });

  it('prefers the stored lesson over the student course progress', async () => {
    loginAsStudent();
    await seedMockLastStudiedLesson({
      email: student.emailAddress,
      courseId: LCSP_COURSE_ID,
      lessonNumber: 5,
      updatedAt: '2026-08-13T00:00:00.000Z',
    });

    const { result } = renderCoordinator();

    await waitFor(() => expect(result.current.toLesson?.lessonNumber).toBe(5));
  });

  it('ignores a stored lesson recorded against a different course', async () => {
    loginAsStudent();
    await seedMockLastStudiedLesson({
      email: student.emailAddress,
      courseId: 3,
      lessonNumber: 5,
      updatedAt: '2026-08-13T00:00:00.000Z',
    });

    const { result } = renderCoordinator();

    await waitFor(() => expect(result.current.course?.id).toBe(LCSP_COURSE_ID));
    await waitFor(() =>
      expect(result.current.toLesson?.lessonNumber).toBe(student.lessonNumber),
    );
  });

  it('lets an explicit selection override the stored lesson', async () => {
    loginAsStudent();
    await seedMockLastStudiedLesson({
      email: student.emailAddress,
      courseId: LCSP_COURSE_ID,
      lessonNumber: 5,
      updatedAt: '2026-08-13T00:00:00.000Z',
    });

    const { result } = renderCoordinator();
    await waitFor(() => expect(result.current.toLesson?.lessonNumber).toBe(5));

    act(() => {
      result.current.updateToLessonNumber(9);
    });

    await waitFor(() => expect(result.current.toLesson?.lessonNumber).toBe(9));
  });

  it('lets an explicit reset to Choose Lesson clear the to-lesson', async () => {
    loginAsStudent();
    await seedMockLastStudiedLesson({
      email: student.emailAddress,
      courseId: LCSP_COURSE_ID,
      lessonNumber: 5,
      updatedAt: '2026-08-13T00:00:00.000Z',
    });

    const { result } = renderCoordinator();
    await waitFor(() => expect(result.current.toLesson?.lessonNumber).toBe(5));

    act(() => {
      result.current.updateToLessonNumber(0);
    });

    await waitFor(() => expect(result.current.toLesson).toBe(null));
  });

  it('uses the stored lesson for a free user with no app data', async () => {
    const limitedAuth = getAuthUserFromEmail('limited@fake.not')!;
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
    await seedMockLastStudiedLesson({
      email: limitedAuth.email,
      courseId: LCSP_COURSE_ID,
      lessonNumber: 5,
      updatedAt: '2026-08-13T00:00:00.000Z',
    });

    const { result } = renderCoordinator();

    await waitFor(() => expect(result.current.course?.id).toBe(LCSP_COURSE_ID));
    await waitFor(() => expect(result.current.toLesson?.lessonNumber).toBe(5));
  });
});
