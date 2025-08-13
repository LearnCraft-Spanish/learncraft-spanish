import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRealisticCourseWithLessonsList } from 'src/hexagon/testing/factories/courseFactory';
import { vi } from 'vitest';
import SelectLesson from './SelectLesson';

vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: () => ({
    data: createRealisticCourseWithLessonsList(),
  }),
}));

const mockProps = {
  value: '1',
  onChange: vi.fn(),
  label: 'Lesson',
  lessons: createRealisticCourseWithLessonsList()[0].lessons,
  id: 'lessonList',
};

describe('component SelectLesson', () => {
  it('should render with label and select', () => {
    render(<SelectLesson {...mockProps} />);
    expect(screen.getByText('Lesson:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: '–Choose Lesson–' }),
    ).toBeInTheDocument();
    mockProps.lessons.forEach((lesson) => {
      expect(
        screen.getByRole('option', {
          name: `Lesson ${lesson.lessonNumber}`,
        }),
      ).toBeInTheDocument();
    });
  });

  it('should call onChange when a lesson is selected', () => {
    render(<SelectLesson {...mockProps} />);
    act(() => {
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: '2' },
      });
    });
    expect(mockProps.onChange).toHaveBeenCalledWith('2');
  });

  it('should render with required label if required is true', () => {
    render(<SelectLesson {...mockProps} required />);
    expect(screen.getByText('Lesson:')).toBeInTheDocument();
    expect(screen.getByText(`${mockProps.label}:`)).toHaveClass('required');
  });

  it('should not render with required label if required is false', () => {
    render(<SelectLesson {...mockProps} required={false} />);
    expect(screen.getByText('Lesson:')).toBeInTheDocument();
    expect(screen.getByText(`${mockProps.label}:`)).not.toHaveClass('required');
  });
});
