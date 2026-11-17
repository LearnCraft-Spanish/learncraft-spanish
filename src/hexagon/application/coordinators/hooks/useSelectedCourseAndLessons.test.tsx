import type { ExampleFilterContextType } from '@application/coordinators/contexts/ExampleFilterContext';
import type { CourseWithLessons } from '@learncraft-spanish/shared';
import type { TestUserEmail } from 'mocks/data/serverlike/userTable';
import type { ReactNode } from 'react';
import { overrideMockCourseAdapter } from '@application/adapters/courseAdapter.mock';
import { seedMockLastStudiedLesson } from '@application/adapters/lastStudiedLessonAdapter.mock';
import { ExampleFilterContext } from '@application/coordinators/contexts/ExampleFilterContext';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import { getPrerequisitesForCourse } from '@domain/coursePrerequisites';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createRealisticCourseWithLessonsList } from '@testing/factories/courseFactory';
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

// Courses in the realistic fixture: 2 = LearnCraft Spanish, 3 = Spanish in One
// Month, 4 = Ser Estar Mini Course, 5 = Post-Challenge Lessons (which has
// Spanish in One Month as a prerequisite)
const LCS_COURSE_ID = 2;
const SER_ESTAR_COURSE_ID = 4;
const POST_CHALLENGE_COURSE_ID = 5;

function loginAsAppUser(email: TestUserEmail) {
  overrideAuthAndAppUser(
    {
      authUser: getAuthUserFromEmail(email)!,
      isAuthenticated: true,
    },
    {
      appUser: getAppUserFromEmail(email)!,
      isOwnUser: true,
    },
  );
}

// Not a student (studentRole 'none'), but has a course and lesson on record
const coachEmail: TestUserEmail = 'admin-empty-role@fake.not';
// studentRole 'student', enrolled in course 5 at lesson 3
const postChallengeStudentEmail: TestUserEmail = 'student-ser-estar@fake.not';

describe('useSelectedCourseAndLessons defaults', () => {
  it('defaults a non-student to LearnCraft Spanish, starting at lesson 2', async () => {
    loginAsAppUser(coachEmail);

    const { result } = renderCoordinator();

    await waitFor(() => expect(result.current.courseId).toBe(LCS_COURSE_ID));
    await waitFor(() => expect(result.current.toLessonNumber).toBe(2));
    expect(result.current.fromLessonNumber).toBe(1);
  });

  it('defaults a student to their own course and lesson', async () => {
    loginAsAppUser(postChallengeStudentEmail);
    const studentRecord = getAppUserFromEmail(postChallengeStudentEmail)!;

    const { result } = renderCoordinator();

    await waitFor(() =>
      expect(result.current.courseId).toBe(POST_CHALLENGE_COURSE_ID),
    );
    await waitFor(() =>
      expect(result.current.toLessonNumber).toBe(studentRecord.lessonNumber),
    );
  });

  it('starts a non-LearnCraft-Spanish course at its first lesson after a course change', async () => {
    loginAsAppUser(coachEmail);
    const { result } = renderCoordinator();
    await waitFor(() => expect(result.current.courseId).toBe(LCS_COURSE_ID));

    act(() => {
      result.current.updateUserSelectedCourseId(SER_ESTAR_COURSE_ID);
    });

    await waitFor(() =>
      expect(result.current.courseId).toBe(SER_ESTAR_COURSE_ID),
    );
    expect(result.current.fromLessonNumber).toBe(1);
    expect(result.current.toLessonNumber).toBe(1);
  });

  it("does not apply a student's progress to a course they are not enrolled in", async () => {
    loginAsAppUser(postChallengeStudentEmail);
    const { result } = renderCoordinator();
    await waitFor(() =>
      expect(result.current.courseId).toBe(POST_CHALLENGE_COURSE_ID),
    );

    // Their recorded lesson is 3, but that belongs to course 5
    act(() => {
      result.current.updateUserSelectedCourseId(LCS_COURSE_ID);
    });

    await waitFor(() => expect(result.current.courseId).toBe(LCS_COURSE_ID));
    expect(result.current.toLessonNumber).toBe(2);
  });

  it('shows no course when the user picks the Choose Course option', async () => {
    loginAsAppUser(coachEmail);
    const { result } = renderCoordinator();
    await waitFor(() => expect(result.current.courseId).toBe(LCS_COURSE_ID));

    // The course selector reports its empty option as course id 0
    act(() => {
      result.current.updateUserSelectedCourseId(0);
    });

    await waitFor(() => expect(result.current.courseId).toBe(null));
    expect(result.current.course).toBe(null);
    expect(result.current.fromLesson).toBe(null);
    expect(result.current.toLesson).toBe(null);
  });
});

describe('useSelectedCourseAndLessons from-lesson', () => {
  it('lets the user choose the from-lesson', async () => {
    loginAsAppUser(coachEmail);
    const { result } = renderCoordinator();
    await waitFor(() => expect(result.current.courseId).toBe(LCS_COURSE_ID));

    act(() => {
      result.current.updateFromLessonNumber(3);
    });

    await waitFor(() => expect(result.current.fromLessonNumber).toBe(3));
    expect(result.current.fromLesson?.courseName).toBe('LearnCraft Spanish');
  });

  it('clears the from-lesson on an explicit reset to Choose Lesson', async () => {
    loginAsAppUser(coachEmail);
    const { result } = renderCoordinator();
    await waitFor(() => expect(result.current.fromLessonNumber).toBe(1));

    act(() => {
      result.current.updateFromLessonNumber(0);
    });

    await waitFor(() => expect(result.current.fromLesson).toBe(null));
    expect(result.current.fromLessonNumber).toBe(null);
  });

  it("starts a course with a prerequisite on the prerequisite's virtual lesson", async () => {
    loginAsAppUser(coachEmail);
    const prerequisite = getPrerequisitesForCourse(POST_CHALLENGE_COURSE_ID)!
      .prerequisites[0];
    const { result } = renderCoordinator();
    await waitFor(() => expect(result.current.courseId).toBe(LCS_COURSE_ID));

    act(() => {
      result.current.updateUserSelectedCourseId(POST_CHALLENGE_COURSE_ID);
    });

    await waitFor(() =>
      expect(result.current.courseId).toBe(POST_CHALLENGE_COURSE_ID),
    );
    // Virtual lessons are negative so they never collide with real lessons
    expect(result.current.fromLessonNumber).toBeLessThan(0);
    expect(result.current.fromLesson?.courseName).toBe(
      prerequisite.displayName,
    );
  });

  it('replaces the virtual prerequisite lesson when a real from-lesson is picked', async () => {
    loginAsAppUser(coachEmail);
    const { result } = renderCoordinator();
    await waitFor(() => expect(result.current.courseId).toBe(LCS_COURSE_ID));
    act(() => {
      result.current.updateUserSelectedCourseId(POST_CHALLENGE_COURSE_ID);
    });
    await waitFor(() =>
      expect(result.current.fromLessonNumber).toBeLessThan(0),
    );

    act(() => {
      result.current.updateFromLessonNumber(2);
    });

    await waitFor(() => expect(result.current.fromLessonNumber).toBe(2));
    expect(result.current.fromLesson?.courseName).toBe(
      'Post-Challenge Lessons',
    );
  });
});

describe('useSelectedCourseAndLessons unpublished courses', () => {
  const unpublishedCourse: CourseWithLessons = {
    id: 99,
    name: 'Unpublished Course',
    published: false,
    lessons: [{ id: 9901, lessonNumber: 1, courseName: 'Unpublished Course' }],
  };

  function makeUnpublishedCourseAvailable() {
    overrideMockCourseAdapter({
      getAllCoursesWithLessons: () =>
        Promise.resolve([
          ...createRealisticCourseWithLessonsList(),
          unpublishedCourse,
        ]),
    });
  }

  function wrapperWithIncludeUnpublished({
    children,
  }: {
    children: ReactNode;
  }) {
    const value: ExampleFilterContextType = {
      exampleFilters: {
        excludeSpanglish: false,
        audioOnly: false,
        skillTagKeys: [],
        includeUnpublished: true,
      },
      updateExampleFilters: vi.fn(),
    };
    return (
      <TestQueryClientProvider>
        <ExampleFilterContext value={value}>
          <SelectedCourseAndLessonsProvider>
            {children}
          </SelectedCourseAndLessonsProvider>
        </ExampleFilterContext>
      </TestQueryClientProvider>
    );
  }

  it('does not offer unpublished courses by default', async () => {
    loginAsAppUser(coachEmail);
    makeUnpublishedCourseAvailable();
    const { result } = renderCoordinator();
    await waitFor(() => expect(result.current.courseId).toBe(LCS_COURSE_ID));

    act(() => {
      result.current.updateUserSelectedCourseId(unpublishedCourse.id);
    });

    await waitFor(() => expect(result.current.courseId).toBe(null));
    expect(result.current.includeUnpublished).toBe(false);
  });

  it('offers unpublished courses when the include-unpublished filter is on', async () => {
    loginAsAppUser(coachEmail);
    makeUnpublishedCourseAvailable();
    const { result } = renderHook(() => useSelectedCourseAndLessons(), {
      wrapper: wrapperWithIncludeUnpublished,
    });
    await waitFor(() => expect(result.current.courseId).toBe(LCS_COURSE_ID));

    act(() => {
      result.current.updateUserSelectedCourseId(unpublishedCourse.id);
    });

    await waitFor(() =>
      expect(result.current.courseId).toBe(unpublishedCourse.id),
    );
    expect(result.current.includeUnpublished).toBe(true);
  });
});

describe('useSelectedCourseAndLessons failures', () => {
  it('surfaces an error and selects no course when courses fail to load', async () => {
    loginAsAppUser(coachEmail);
    overrideMockCourseAdapter({
      getPublishedCoursesWithLessons: () =>
        Promise.reject(new Error('courses unavailable')),
    });

    const { result } = renderCoordinator();

    await waitFor(() =>
      expect(result.current.error?.message).toBe('courses unavailable'),
    );
    expect(result.current.course).toBe(null);
    expect(result.current.fromLesson).toBe(null);
    expect(result.current.toLesson).toBe(null);
  });

  it('throws when used outside its provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useSelectedCourseAndLessons())).toThrow(
      'useSelectedCourseAndLessons must be used within a SelectedCourseAndLessonsProvider',
    );
  });
});
