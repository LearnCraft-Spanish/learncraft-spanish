import type { SelectedCourseAndLessonsContextType } from '@application/coordinators/contexts/SelectedCourseAndLessonsContext';
import type { ReactNode } from 'react';
import SelectedCourseAndLessonsContext from '@application/coordinators/contexts/SelectedCourseAndLessonsContext';
import { SelectedCourseAndLessonsProvider } from '@application/coordinators/providers/SelectedCourseAndLessonsProvider';
import {
  getPrerequisiteFromVirtualId,
  getPrerequisitesForCourse,
} from '@domain/coursePrerequisites';
import { act, renderHook } from '@testing-library/react';
import { use } from 'react';
import { describe, expect, it } from 'vitest';

// Course 5 (Post-Challenge Lessons) has a prerequisite course; course 4 has none
const COURSE_WITH_PREREQUISITE = 5;
const COURSE_WITHOUT_PREREQUISITE = 4;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SelectedCourseAndLessonsProvider>
      {children}
    </SelectedCourseAndLessonsProvider>
  );
}

function renderContext() {
  return renderHook(
    (): SelectedCourseAndLessonsContextType =>
      use(SelectedCourseAndLessonsContext)!,
    { wrapper },
  );
}

describe('selectedCourseAndLessonsProvider', () => {
  it('starts with no course or lessons chosen by the user', () => {
    const { result } = renderContext();

    expect(result.current.userSelectedCourseId).toBe(null);
    expect(result.current.fromLessonNumber).toBe(null);
    expect(result.current.toLessonNumber).toBe(null);
  });

  it('stores the course the user selects', () => {
    const { result } = renderContext();

    act(() => result.current.updateUserSelectedCourseId(3));

    expect(result.current.userSelectedCourseId).toBe(3);
  });

  it('stores the from and to lessons the user selects', () => {
    const { result } = renderContext();

    act(() => result.current.updateFromLessonNumber(4));
    act(() => result.current.updateToLessonNumber(9));

    expect(result.current.fromLessonNumber).toBe(4);
    expect(result.current.toLessonNumber).toBe(9);
  });

  it('clears the to-lesson when the course changes, since lesson numbers are per course', () => {
    const { result } = renderContext();
    act(() => result.current.updateUserSelectedCourseId(2));
    act(() => result.current.updateToLessonNumber(9));
    expect(result.current.toLessonNumber).toBe(9);

    act(() => result.current.updateUserSelectedCourseId(3));

    expect(result.current.toLessonNumber).toBe(null);
  });

  it("starts a course with prerequisites on its first prerequisite's virtual lesson", () => {
    const { result } = renderContext();
    const [firstPrerequisite] = getPrerequisitesForCourse(
      COURSE_WITH_PREREQUISITE,
    )!.prerequisites;

    act(() =>
      result.current.updateUserSelectedCourseId(COURSE_WITH_PREREQUISITE),
    );

    expect(result.current.fromLessonNumber).toBeLessThan(0);
    expect(
      getPrerequisiteFromVirtualId(result.current.fromLessonNumber!),
    ).toEqual(firstPrerequisite);
  });

  it('drops a prerequisite from-lesson when switching to a course without prerequisites', () => {
    const { result } = renderContext();
    act(() =>
      result.current.updateUserSelectedCourseId(COURSE_WITH_PREREQUISITE),
    );
    expect(result.current.fromLessonNumber).not.toBe(null);

    act(() =>
      result.current.updateUserSelectedCourseId(COURSE_WITHOUT_PREREQUISITE),
    );

    expect(result.current.fromLessonNumber).toBe(null);
  });

  it('resets a manually chosen from-lesson when the course changes', () => {
    const { result } = renderContext();
    act(() => result.current.updateFromLessonNumber(7));

    act(() =>
      result.current.updateUserSelectedCourseId(COURSE_WITHOUT_PREREQUISITE),
    );

    expect(result.current.fromLessonNumber).toBe(null);
  });
});
