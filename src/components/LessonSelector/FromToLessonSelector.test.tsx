import {
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import {
  getAppUserFromName,
  getAuthUserFromEmail,
} from 'mocks/data/serverlike/userTable';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { act } from 'react';

import { useSelectedCourseAndLessons } from 'src/hexagon/application/coordinators/hooks/useSelectedCourseAndLessons';
import { overrideAuthAndAppUser } from 'src/hexagon/testing/utils/overrideAuthAndAppUser';
import { useProgramTable } from 'src/hooks/CourseData/useProgramTable';
import { beforeEach, describe, expect, it } from 'vitest';
import FromToLessonSelector from './FromToLessonSelector';
interface WrapperProps {
  children: React.ReactNode;
}

const student = getAppUserFromName('student-admin')!;
if (!student) throw new Error('No student found');

describe('component FromToLessonSelector', () => {
  const wrapper = ({ children }: WrapperProps) => (
    <MockAllProviders>{children}</MockAllProviders>
  );

  beforeEach(async () => {
    overrideAuthAndAppUser(
      {
        authUser: getAuthUserFromEmail('student-admin@fake.not')!,
        isLoading: false,
        isAdmin: true,
        isCoach: true,
        isStudent: true,
        isLimited: false,
      },
      {
        isOwnUser: true,
      },
    );
    // render component, wait for it to load
    render(<FromToLessonSelector />, { wrapper });
    await waitFor(() => expect(screen.getByText('From:')).toBeInTheDocument());
  });

  describe('initial state', () => {
    it('label text for course, to, and from exist', async () => {
      // Tests
      expect(screen.getByText('Course:')).toBeInTheDocument();
      expect(screen.getByText('From:')).toBeInTheDocument();
      expect(screen.getByText('To:')).toBeInTheDocument();
    });

    it('course dropdown has all programs that have lessons', async () => {
      const { result } = renderHook(() => useProgramTable(), { wrapper });
      await waitFor(() => {
        expect(result.current.programTableQuery.isSuccess).toBe(true);
      });

      const programs = result.current.programTableQuery.data;
      if (!programs) throw new Error('No programs found');
      // Tests
      programs
        .filter((program) => program.lessons.length > 0)
        .forEach((program) => {
          expect(screen.getByText(program.name)).toBeInTheDocument();
        });
    });

    it('selected course is the related program of current user', async () => {
      const courseSelect = screen.getByLabelText('Course:');
      // Tests
      expect((courseSelect as HTMLSelectElement).value).toBe(
        student.courseId.toString(),
      );
    });
  });

  it.skip('when course is "-Choose Course-" (value = 0), from and to selectors are not displayed', async () => {
    const result = renderHook(() => useSelectedCourseAndLessons(), { wrapper });
    await waitFor(() => {
      expect(result.result.current.course).not.toBeNull();
    });
    // Set course to 0
    act(() => {
      result.result.current.updateUserSelectedCourseId(0);
    });
    const courseSelect = screen.getByLabelText('Course:');
    await waitFor(() =>
      expect((courseSelect as HTMLSelectElement).value).toBe('0'),
    );
    // Tests
    expect(screen.queryByText('From:')).not.toBeInTheDocument();
    expect(screen.queryByText('To:')).not.toBeInTheDocument();
  });

  // This behavior is described incorrectly:
  // the "to" selector only goes back to the from lesson, not to the beginning of the course
  it.skip('to selector has all lessons of that course', async () => {
    const result = renderHook(() => useSelectedCourseAndLessons(), { wrapper });
    act(() => {
      result.result.current.updateUserSelectedCourseId(2);
    });
    await waitFor(() => {
      expect(result.result.current.course?.lessons).not.toBeNull();
    });
    // Setup
    const toSelectorContainer = screen.getByLabelText('To:').closest('label');
    const toSelect = within(toSelectorContainer as HTMLElement).getByRole(
      'combobox',
    );
    const lessons = result.result.current.course?.lessons;
    if (!lessons) throw new Error('No lessons found');
    // Tests
    lessons.forEach((lesson) => {
      expect(toSelect).toHaveTextContent(`Lesson ${lesson.lessonNumber}`);
    });
  });

  it('from selector has all lessons up to current value of toSelector', async () => {
    const result = renderHook(() => useSelectedCourseAndLessons(), { wrapper });
    await waitFor(() => {
      expect(result.result.current.course).not.toBeNull();
    });
    // Setup
    const fromSelectorContainer = screen
      .getByLabelText('From:')
      .closest('label');
    const fromSelect = within(fromSelectorContainer as HTMLElement).getByRole(
      'combobox',
    );
    // get selected lesson from toSelector
    const toSelectorContainer = screen.getByLabelText('To:').closest('label');
    const toSelect = within(toSelectorContainer as HTMLElement).getByRole(
      'combobox',
    );
    const toSelectValue = (toSelect as HTMLSelectElement).value;
    const toLessonRecordId = Number.parseInt(toSelectValue);
    const toSelectedLesson = result.result.current.course?.lessons.find(
      (lesson) => lesson.id === toLessonRecordId,
    );
    if (!toSelectedLesson) throw new Error('No lesson found');
    const toLessonNumber = toSelectedLesson.lessonNumber;
    if (!toLessonNumber) throw new Error('No lesson number found');
    // lesson array
    const lessons = result.result.current.course?.lessons;
    if (!lessons) throw new Error('No lessons found');
    // Tests
    lessons.forEach((lesson) => {
      const lessonNumber = lesson.lessonNumber;
      if (!lessonNumber) throw new Error('No lesson number found');
      if (lessonNumber <= toLessonNumber) {
        expect(fromSelect).toHaveTextContent(`Lesson ${lessonNumber}`);
      } else {
        expect(fromSelect).not.toHaveTextContent(`Lesson ${lessonNumber}`);
      }
    });
  });
});
