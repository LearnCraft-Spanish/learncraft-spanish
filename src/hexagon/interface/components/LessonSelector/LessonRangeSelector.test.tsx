import {
  mockSelectedCourseAndLessons,
  overrideMockSelectedCourseAndLessons,
} from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import LessonRangeSelector from '@interface/components/LessonSelector/LessonRangeSelector';
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

describe('component LessonRangeSelector', () => {
  it('should render with select course & no lesson when no course is selected', () => {
    overrideMockSelectedCourseAndLessons({
      course: null,
      fromLesson: null,
      toLesson: null,
    });
    render(<LessonRangeSelector />);
    expect(screen.getByText('Course:')).toBeInTheDocument();
    expect(screen.getByText('–Choose Course–')).toBeInTheDocument();

    expect(screen.getAllByRole('combobox')).toHaveLength(2);
    expect(screen.getAllByRole('combobox')[1]).toHaveValue('0');
  });

  it('should render with course and lesson', () => {
    overrideMockSelectedCourseAndLessons({
      course: courseList[0],
      fromLesson: courseList[0].lessons[0],
      toLesson: courseList[0].lessons[1],
    });
    render(<LessonRangeSelector />);
    expect(screen.getByText('Course:')).toBeInTheDocument();
    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getByText('To:')).toBeInTheDocument();
    expect(screen.getByText(courseList[0].name)).toBeInTheDocument();
    expect(
      screen.getAllByText(`Lesson ${courseList[0].lessons[0].lessonNumber}`)
        .length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(`Lesson ${courseList[0].lessons[1].lessonNumber}`)
        .length,
    ).toBeGreaterThanOrEqual(1);

    expect(screen.getByRole('combobox', { name: 'Course:' })).toHaveValue(
      courseList[0].id.toString(),
    );
    expect(screen.getAllByRole('combobox')[1]).toHaveValue(
      courseList[0].lessons[0].lessonNumber.toString(),
    );
    expect(screen.getAllByRole('combobox')[2]).toHaveValue(
      courseList[0].lessons[1].lessonNumber.toString(),
    );
  });

  it('should render with 2 options for From: when To lesson is 2', () => {
    overrideMockSelectedCourseAndLessons({
      course: courseList[0],
      fromLesson: courseList[0].lessons[0],
      toLesson: courseList[0].lessons[1],
    });
    render(<LessonRangeSelector />);
    expect(screen.getAllByRole('combobox')[1]).toHaveLength(3);
  });

  it('should render toLesson without lesson 1 when From lesson is 2 and To lesson is 3', () => {
    overrideMockSelectedCourseAndLessons({
      course: courseList[0],
      fromLesson: courseList[0].lessons[1],
      toLesson: courseList[0].lessons[2],
    });
    render(<LessonRangeSelector />);
    expect(screen.getAllByRole('combobox')[2]).not.toHaveValue(
      courseList[0].lessons[0].lessonNumber.toString(),
    );
  });

  it('should render toLesson with all lessons when there is no from lesson', () => {
    overrideMockSelectedCourseAndLessons({
      course: courseList[0],
      fromLesson: null,
      toLesson: courseList[0].lessons[0],
    });
    render(<LessonRangeSelector />);
    expect(screen.getAllByRole('combobox')[2]).toHaveLength(
      courseList[0].lessons.length + 1,
    );

    expect(screen.getAllByRole('combobox')[1]).toHaveLength(2);
  });

  it('should call updateUserSelectedCourseId when course is changed', () => {
    render(<LessonRangeSelector />);
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: courseList[1].id.toString() },
    });
    expect(
      mockSelectedCourseAndLessons.updateUserSelectedCourseId,
    ).toHaveBeenCalledWith(courseList[1].id);
  });

  it('should call updateFromLessonNumber when fromLesson is changed', () => {
    overrideMockSelectedCourseAndLessons({
      course: courseList[0],
      fromLesson: courseList[0].lessons[0],
      toLesson: courseList[0].lessons[1],
    });
    render(<LessonRangeSelector />);
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: courseList[0].lessons[1].lessonNumber.toString() },
    });
    expect(
      mockSelectedCourseAndLessons.updateFromLessonNumber,
    ).toHaveBeenCalledWith(courseList[0].lessons[1].lessonNumber);
  });

  it('should call updateToLessonNumber when toLesson is changed', () => {
    overrideMockSelectedCourseAndLessons({
      course: courseList[0],
      fromLesson: courseList[0].lessons[0],
      toLesson: courseList[0].lessons[1],
    });
    render(<LessonRangeSelector />);
    fireEvent.change(screen.getAllByRole('combobox')[2], {
      target: { value: courseList[0].lessons[5].lessonNumber.toString() },
    });
    expect(
      mockSelectedCourseAndLessons.updateToLessonNumber,
    ).toHaveBeenCalledWith(courseList[0].lessons[5].lessonNumber);
  });
});
