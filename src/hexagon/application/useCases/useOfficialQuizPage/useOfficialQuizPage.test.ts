import type { QuizGroup } from '@learncraft-spanish/shared';
import { mockLastStudiedLessonAdapter } from '@application/adapters/lastStudiedLessonAdapter.mock';
import { overrideMockOfficialQuizAdapter } from '@application/adapters/officialQuizAdapter.mock';
import { useOfficialQuizPage } from '@application/useCases/useOfficialQuizPage/useOfficialQuizPage';
import { renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { overrideAuthAndAppUser } from '@testing/utils/overrideAuthAndAppUser';
import {
  getAppUserFromEmail,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import { beforeEach, describe, expect, it } from 'vitest';

// recordId 8, courseId 2
const student = getAppUserFromEmail('student-no-flashcards@fake.not')!;

// Course 2 (LearnCraft Spanish) in the course factory has lessons 1-11 and 62
const LCSP_COURSE_ID = 2;

function buildQuizGroup(overrides: Partial<QuizGroup> = {}): QuizGroup {
  return {
    id: 1,
    name: 'LearnCraft Spanish',
    urlSlug: 'lcsp',
    courseId: LCSP_COURSE_ID,
    published: true,
    quizzes: [
      {
        id: 1,
        quizNumber: 5,
        quizTitle: 'Lesson 5 Quiz',
        published: true,
        relatedQuizGroupId: 1,
      },
      {
        id: 2,
        quizNumber: 101,
        quizTitle: 'Unit 1 Quiz',
        published: true,
        relatedQuizGroupId: 1,
      },
    ],
    ...overrides,
  };
}

function renderQuizPage(quizNumber: number, courseCode = 'lcsp') {
  return renderHook(() => useOfficialQuizPage({ courseCode, quizNumber }), {
    wrapper: TestQueryClientProvider,
  });
}

describe('useOfficialQuizPage', () => {
  beforeEach(() => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-no-flashcards@fake.not')!,
        isAuthenticated: true,
        isStudent: true,
        isCoach: false,
        isAdmin: false,
        isLimited: false,
      },
      { appUser: student, isOwnUser: true },
    );
    overrideMockOfficialQuizAdapter({
      getOfficialQuizGroups: async () => [buildQuizGroup()],
    });
  });

  it('exposes the quiz examples and title for the page', async () => {
    const { result } = renderQuizPage(5);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.quizExamples).toHaveLength(3);
    expect(result.current.quizTitle).toBe('Lesson 5 Quiz');
  });

  it('records the lesson when the quiz number matches a lesson in the course', async () => {
    renderQuizPage(5);

    await waitFor(() =>
      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledWith({
        email: student.emailAddress,
        courseId: LCSP_COURSE_ID,
        lessonNumber: 5,
      }),
    );
  });

  it('records only once across re-renders', async () => {
    const { rerender } = renderQuizPage(5);

    await waitFor(() =>
      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledTimes(1),
    );

    rerender();
    rerender();

    expect(
      mockLastStudiedLessonAdapter.setLastStudiedLesson,
    ).toHaveBeenCalledTimes(1);
  });

  it('does not record when the course numbers quizzes differently', async () => {
    const { result } = renderQuizPage(101);

    await waitFor(() => expect(result.current.quizExamples).toBeDefined());

    expect(
      mockLastStudiedLessonAdapter.setLastStudiedLesson,
    ).not.toHaveBeenCalled();
  });

  it('does not record when the quiz group has no course', async () => {
    overrideMockOfficialQuizAdapter({
      getOfficialQuizGroups: async () => [buildQuizGroup({ courseId: null })],
    });

    const { result } = renderQuizPage(5);

    await waitFor(() => expect(result.current.quizExamples).toBeDefined());

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

    renderQuizPage(5);

    await waitFor(() =>
      expect(
        mockLastStudiedLessonAdapter.setLastStudiedLesson,
      ).toHaveBeenCalledWith({
        email: 'limited@fake.not',
        courseId: LCSP_COURSE_ID,
        lessonNumber: 5,
      }),
    );
  });
});
