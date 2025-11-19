import SelectCourse from '@interface/components/LessonSelector/SelectCourse';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRealisticCourseWithLessonsList } from '@testing/factories/courseFactory';
import { vi } from 'vitest';

vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: () => ({
    data: createRealisticCourseWithLessonsList(),
  }),
}));

const mockProps = {
  value: '1',
  onChange: vi.fn(),
};

const courseNames = createRealisticCourseWithLessonsList().map(
  (course) => course.name,
);

describe('component SelectCourse', () => {
  it('should render with label and select', () => {
    render(<SelectCourse {...mockProps} />);
    expect(screen.getByText('Course:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: '–Choose Course–' }),
    ).toBeInTheDocument();
    courseNames.forEach((courseName) => {
      expect(
        screen.getByRole('option', { name: courseName }),
      ).toBeInTheDocument();
    });
  });

  it('should call onChange when a course is selected', () => {
    render(<SelectCourse {...mockProps} />);
    act(() => {
      fireEvent.change(screen.getByRole('combobox'), {
        target: { value: '2' },
      });
    });
    expect(mockProps.onChange).toHaveBeenCalledWith('2');
  });
});
