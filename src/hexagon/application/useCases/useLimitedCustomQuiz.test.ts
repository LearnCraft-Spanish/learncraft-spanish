import { mockLastStudiedLessonAdapter } from '@application/adapters/lastStudiedLessonAdapter.mock';
import { overrideMockSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import { useLimitedCustomQuiz } from '@application/useCases/useLimitedCustomQuiz';
import { act, renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/audioAdapter', () => ({
  useAudioAdapter: () => ({ primeAudioElement: vi.fn<() => void>() }),
}));

// recordId 4, courseId 2, lessonNumber 15
const limitedUser = getAppUserFromEmail('limited@fake.not')!;

const lcspCourse = {
  id: 2,
  name: 'LearnCraft Spanish',
  published: true,
  lessons: [
    { id: 71, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
    { id: 84, lessonNumber: 15, courseName: 'LearnCraft Spanish' },
  ],
};

describe('useLimitedCustomQuiz last studied lesson recording', () => {
  beforeEach(() => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('limited@fake.not')!,
        isAuthenticated: true,
        isStudent: false,
        isCoach: false,
        isAdmin: false,
        isLimited: true,
      },
      { appUser: limitedUser, isOwnUser: true },
    );
  });

  it('records the selected To lesson when the quiz starts', async () => {
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      toLesson: lcspCourse.lessons[1],
      toLessonNumber: 15,
    });

    const { result } = renderHook(() => useLimitedCustomQuiz(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.readyQuiz();
    });

    await waitFor(() =>
      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledWith({
        email: limitedUser.emailAddress,
        courseId: lcspCourse.id,
        lessonNumber: 15,
      }),
    );
  });

  it('does not record when no lesson is selected', async () => {
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      toLesson: null,
      toLessonNumber: null,
    });

    const { result } = renderHook(() => useLimitedCustomQuiz(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.readyQuiz();
    });

    expect(
      mockLastStudiedLessonAdapter.setLastStudiedLesson,
    ).not.toHaveBeenCalled();
  });

  it('records for a free user with no app data', async () => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('limited@fake.not')!,
        isAuthenticated: true,
        isStudent: false,
        isCoach: false,
        isAdmin: false,
        isLimited: true,
      },
      { appUser: null, isOwnUser: true },
    );
    overrideMockSelectedCourseAndLessons({
      course: lcspCourse,
      courseId: lcspCourse.id,
      toLesson: lcspCourse.lessons[1],
      toLessonNumber: 15,
    });

    const { result } = renderHook(() => useLimitedCustomQuiz(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.readyQuiz();
    });

    await waitFor(() =>
      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledWith({
        email: 'limited@fake.not',
        courseId: lcspCourse.id,
        lessonNumber: 15,
      }),
    );
  });
});
