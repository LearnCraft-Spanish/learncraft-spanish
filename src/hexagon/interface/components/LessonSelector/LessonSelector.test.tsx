import {
  mockSelectedCourseAndLessons,
  overrideMockSelectedCourseAndLessons,
  resetMockSelectedCourseAndLessons,
} from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import LessonSelector from '@interface/components/LessonSelector/LessonSelector';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRealisticCourseWithLessonsList } from '@testing/factories/courseFactory';
import { vi } from 'vitest';

vi.mock('@application/coordinators/hooks/useSelectedCourseAndLessons', () => ({
  useSelectedCourseAndLessons: () => mockSelectedCourseAndLessons,
}));

vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: () => ({
    data: createRealisticCourseWithLessonsList(),
  }),
}));

const courseList = createRealisticCourseWithLessonsList();

describe('component LessonSelector', () => {
  beforeEach(() => {
    resetMockSelectedCourseAndLessons();
  });

  it('should render with select course & no lesson when no course is selected', () => {
    overrideMockSelectedCourseAndLessons({
      course: null,
      toLesson: null,
    });
    render(<LessonSelector />);
    expect(screen.getByText('Course:')).toBeInTheDocument();
    expect(screen.getByText('–Choose Course–')).toBeInTheDocument();

    expect(screen.getByRole('combobox', { name: 'Course:' })).toHaveValue('0');
  });

  it('should render with course and lesson', () => {
    overrideMockSelectedCourseAndLessons({
      course: courseList[0],
      toLesson: courseList[0].lessons[1],
    });
    render(<LessonSelector />);
    expect(screen.getByText('Course:')).toBeInTheDocument();
    expect(screen.getByText('Lesson:')).toBeInTheDocument();
    expect(screen.getByText(courseList[0].name)).toBeInTheDocument();
    expect(
      screen.getByText(`Lesson ${courseList[0].lessons[1].lessonNumber}`),
    ).toBeInTheDocument();

    expect(screen.getByRole('combobox', { name: 'Course:' })).toHaveValue(
      courseList[0].id.toString(),
    );
    expect(screen.getAllByRole('combobox')[1]).toHaveValue(
      courseList[0].lessons[1].lessonNumber.toString(),
    );
  });

  it('should call updateUserSelectedCourseId when course is changed', () => {
    render(<LessonSelector />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Course:' }), {
      target: { value: courseList[1].id.toString() },
    });
    expect(
      mockSelectedCourseAndLessons.updateUserSelectedCourseId,
    ).toHaveBeenCalledWith(courseList[1].id);
  });

  it('should call updateToLessonNumber when lesson is changed', () => {
    overrideMockSelectedCourseAndLessons({
      course: courseList[0],
      toLesson: courseList[0].lessons[1],
    });
    render(<LessonSelector />);
    const comboboxes = screen.getAllByRole('combobox');
    fireEvent.change(comboboxes[1] as HTMLSelectElement, {
      target: { value: courseList[0].lessons[3].lessonNumber.toString() },
    });

    expect(
      mockSelectedCourseAndLessons.updateToLessonNumber,
    ).toHaveBeenCalledWith(courseList[0].lessons[3].lessonNumber);
  });
});
