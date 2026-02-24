import SelectCourse from '@interface/components/LessonSelector/SelectCourse';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRealisticCourseWithLessonsList } from '@testing/factories/courseFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseCoursesWithLessons = vi.fn();
vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: (includeUnpublished?: boolean) =>
    mockUseCoursesWithLessons(includeUnpublished),
}));

const mockProps = {
  value: '1',
  onChange: vi.fn(),
};

const courseNames = createRealisticCourseWithLessonsList().map(
  (course) => course.name,
);

describe('component SelectCourse', () => {
  beforeEach(() => {
    mockUseCoursesWithLessons.mockReturnValue({
      data: createRealisticCourseWithLessonsList(),
    });
  });

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

  it('calls useCoursesWithLessons with false when includeUnpublished is not passed', () => {
    render(<SelectCourse {...mockProps} />);
    expect(mockUseCoursesWithLessons).toHaveBeenCalledWith(false);
  });

  it('calls useCoursesWithLessons with true when includeUnpublished is true', () => {
    render(<SelectCourse {...mockProps} includeUnpublished />);
    expect(mockUseCoursesWithLessons).toHaveBeenCalledWith(true);
  });
});
