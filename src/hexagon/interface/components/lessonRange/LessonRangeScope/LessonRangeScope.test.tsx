import type { CourseWithLessons } from '@learncraft-spanish/shared';
import { LessonRangeScope } from '@interface/components/lessonRange/LessonRangeScope/LessonRangeScope';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

function course(id: number, name: string, count: number): CourseWithLessons {
  return {
    id,
    name,
    published: true,
    lessons: Array.from({ length: count }, (_, index) => ({
      id: id * 100 + index + 1,
      courseName: name,
      lessonNumber: index + 1,
    })),
  };
}

const LCS = course(2, 'LearnCraft Spanish', 30);
const SI1M = course(3, 'Spanish in One Month', 20);
/* Course 5 lists a prerequisite, so its from-list gains a virtual lesson. */
const POST = course(5, 'Post-Challenge Lessons', 10);

interface RenderOptions {
  course?: CourseWithLessons | null;
  from?: number | null;
  to?: number | null;
}

function renderScope(options: RenderOptions = {}): {
  onCourseChange: ReturnType<typeof vi.fn>;
  onFromLessonChange: ReturnType<typeof vi.fn>;
  onToLessonChange: ReturnType<typeof vi.fn>;
} {
  const onCourseChange = vi.fn();
  const onFromLessonChange = vi.fn();
  const onToLessonChange = vi.fn();
  render(
    <LessonRangeScope
      idPrefix="scope"
      course={options.course === undefined ? LCS : options.course}
      coursesWithLessons={[LCS, SI1M, POST]}
      fromLessonNumber={options.from === undefined ? 1 : options.from}
      toLessonNumber={options.to === undefined ? 12 : options.to}
      onCourseChange={onCourseChange}
      onFromLessonChange={onFromLessonChange}
      onToLessonChange={onToLessonChange}
    />,
  );
  return { onCourseChange, onFromLessonChange, onToLessonChange };
}

describe('lessonRangeScope', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the course as a name, not a picker', () => {
    renderScope();

    expect(screen.getByText('LearnCraft Spanish')).toBeInTheDocument();
    expect(screen.queryByLabelText('Course')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Change course' }),
    ).toBeInTheDocument();
  });

  it('puts both lesson ends on the main surface', () => {
    renderScope();

    expect(screen.getByLabelText('From lesson')).toHaveValue(
      'Lesson 1 — from the start',
    );
    expect(screen.getByLabelText('Up to lesson')).toHaveValue('Lesson 12');
  });

  it('reveals a focused course dropdown behind the change action', async () => {
    const user = userEvent.setup();
    renderScope();

    await user.click(screen.getByRole('button', { name: 'Change course' }));

    const picker = screen.getByLabelText('Course');
    expect(picker.tagName).toBe('SELECT');
    expect(picker).toHaveFocus();
    expect(picker).toHaveDisplayValue('LearnCraft Spanish');
    expect(
      screen.queryByRole('button', { name: 'Change course' }),
    ).not.toBeInTheDocument();
  });

  it('reports the new course and folds the dropdown away', async () => {
    const user = userEvent.setup();
    const { onCourseChange } = renderScope();

    await user.click(screen.getByRole('button', { name: 'Change course' }));
    await user.selectOptions(screen.getByLabelText('Course'), '3');

    expect(onCourseChange).toHaveBeenCalledWith(3);
    expect(screen.queryByLabelText('Course')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change course' })).toHaveFocus();
  });

  it('cancels a course change without reporting anything', async () => {
    const user = userEvent.setup();
    const { onCourseChange } = renderScope();

    await user.click(screen.getByRole('button', { name: 'Change course' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCourseChange).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Course')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change course' })).toHaveFocus();
  });

  it('cancels a course change on Escape', async () => {
    const user = userEvent.setup();
    const { onCourseChange } = renderScope();

    await user.click(screen.getByRole('button', { name: 'Change course' }));
    await user.keyboard('{Escape}');

    expect(onCourseChange).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Course')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Change course' }),
    ).toBeInTheDocument();
  });

  it('narrows the from-lesson list by typing a number', async () => {
    const user = userEvent.setup();
    const { onFromLessonChange } = renderScope();

    await user.click(screen.getByLabelText('From lesson'));
    await user.keyboard('7');

    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Enter}');
    expect(onFromLessonChange).toHaveBeenCalledWith(7);
  });

  it('only offers from-lessons at or before the current end', async () => {
    const user = userEvent.setup();
    renderScope({ to: 5 });

    await user.click(screen.getByLabelText('From lesson'));

    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('only offers to-lessons at or after the current start', async () => {
    const user = userEvent.setup();
    const { onToLessonChange } = renderScope({ from: 25 });

    await user.click(screen.getByLabelText('Up to lesson'));

    expect(screen.getAllByRole('option')).toHaveLength(6);
    await user.click(screen.getByRole('option', { name: 'Lesson 28' }));
    expect(onToLessonChange).toHaveBeenCalledWith(28);
  });

  it('keeps prerequisite courses at the head of the from-list', async () => {
    const user = userEvent.setup();
    renderScope({ course: POST, from: null, to: 10 });

    await user.click(screen.getByLabelText('From lesson'));

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent(
      'All si1m Lessons (1-20) — from the start',
    );
    expect(options).toHaveLength(11);
  });

  it('shows the course dropdown outright when nothing is chosen yet', async () => {
    const user = userEvent.setup();
    const { onCourseChange } = renderScope({
      course: null,
      from: null,
      to: null,
    });

    const picker = screen.getByLabelText('Course');
    expect(picker).toHaveDisplayValue('Choose a course');
    expect(picker).not.toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Change course' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('From lesson')).toBeDisabled();
    expect(screen.getByLabelText('Up to lesson')).toBeDisabled();

    picker.focus();
    await user.keyboard('{Escape}');
    expect(screen.getByLabelText('Course')).toBeInTheDocument();

    await user.selectOptions(picker, '2');
    expect(onCourseChange).toHaveBeenCalledWith(2);
  });
});
