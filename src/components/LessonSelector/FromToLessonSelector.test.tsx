import { beforeEach, describe, expect, it } from 'vitest';
import {
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import { act } from 'react';
import { useProgramTable } from 'src/hooks/CourseData/useProgramTable';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import { getUserDataFromName } from 'mocks/data/serverlike/studentTable';

import type { Lesson } from 'src/types/interfaceDefinitions';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import FromToLessonSelector from './FromToLessonSelector';

interface WrapperProps {
  children: React.ReactNode;
}

const userName = 'student-admin';
const student = getUserDataFromName(userName);
if (!student) throw new Error('No student found');

// HELPER FUNCTION - this is copy-pasted from FromToLessonSelector
function getLessonNumber(lesson: Lesson | null): number | null {
  if (!lesson?.lesson) {
    return null;
  }
  const lessonArray = lesson.lesson.split(' ');
  const lessonNumberString = lessonArray.slice(-1)[0];
  const lessonNumber = Number.parseInt(lessonNumberString, 10);
  return lessonNumber;
}

describe('component FromToLessonSelector', () => {
  const wrapper = ({ children }: WrapperProps) => (
    <MockAllProviders>{children}</MockAllProviders>
  );

  beforeEach(async () => {
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

    it('course dropdown has all programs', async () => {
      const { result } = renderHook(() => useProgramTable(), { wrapper });
      await waitFor(() => {
        expect(result.current.programTableQuery.isSuccess).toBe(true);
      });

      const programs = result.current.programTableQuery.data;
      if (!programs) throw new Error('No programs found');
      // Tests
      programs.forEach((program) => {
        expect(screen.getByText(program.name)).toBeInTheDocument();
      });
    });

    it('selected course is the related program of current user', async () => {
      const courseSelect = screen.getByLabelText('Course:');
      // Tests
      expect((courseSelect as HTMLSelectElement).value).toBe(
        student.relatedProgram.toString(),
      );
    });
  });

  it.skip('when course is "-Choose Course-" (value = 0), from and to selectors are not displayed', async () => {
    const result = renderHook(() => useSelectedLesson(), { wrapper });
    await waitFor(() => {
      expect(result.result.current.selectedProgram).not.toBeNull();
    });
    // Set course to 0
    act(() => {
      result.result.current.setProgram(0);
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
    const result = renderHook(() => useSelectedLesson(), { wrapper });
    act(() => {
      result.result.current.setProgram(2);
    });
    await waitFor(() => {
      expect(result.result.current.selectedProgram?.lessons).not.toBeNull();
    });
    // Setup
    const toSelectorContainer = screen.getByLabelText('To:').closest('label');
    const toSelect = within(toSelectorContainer as HTMLElement).getByRole(
      'combobox',
    );
    const lessons = result.result.current.selectedProgram?.lessons;
    if (!lessons) throw new Error('No lessons found');
    // Tests
    lessons.forEach((lesson) => {
      const lessonNumber = getLessonNumber(lesson);
      if (!lessonNumber) throw new Error('No lesson number found');
      expect(toSelect).toHaveTextContent(`Lesson ${lessonNumber}`);
    });
  });

  it('from selector has all lessons up to current value of toSelector', async () => {
    const result = renderHook(() => useSelectedLesson(), { wrapper });
    await waitFor(() => {
      expect(result.result.current.selectedProgram).not.toBeNull();
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
    const toSelectedLesson =
      result.result.current.selectedProgram?.lessons.find(
        (lesson) => lesson.recordId === toLessonRecordId,
      );
    if (!toSelectedLesson) throw new Error('No lesson found');
    const toLessonNumber = getLessonNumber(toSelectedLesson);
    if (!toLessonNumber) throw new Error('No lesson number found');
    // lesson array
    const lessons = result.result.current.selectedProgram?.lessons;
    if (!lessons) throw new Error('No lessons found');
    // Tests
    lessons.forEach((lesson) => {
      const lessonNumber = getLessonNumber(lesson);
      if (!lessonNumber) throw new Error('No lesson number found');
      if (lessonNumber <= toLessonNumber) {
        expect(fromSelect).toHaveTextContent(`Lesson ${lessonNumber}`);
      } else {
        expect(fromSelect).not.toHaveTextContent(`Lesson ${lessonNumber}`);
      }
    });
  });
});
