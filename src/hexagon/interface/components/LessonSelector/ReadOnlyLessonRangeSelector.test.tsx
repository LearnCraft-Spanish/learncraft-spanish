import {
  mockSelectedCourseAndLessons,
  overrideMockSelectedCourseAndLessons,
} from '@application/coordinators/hooks/useSelectedCourseAndLessons.mock';
import ReadOnlyLessonRangeSelector from '@interface/components/LessonSelector/ReadOnlyLessonRangeSelector';
import { render, screen } from '@testing-library/react';
import { createRealisticCourseWithLessonsList } from '@testing/factories/courseFactory';
import { vi } from 'vitest';

vi.mock('@application/coordinators/hooks/useSelectedCourseAndLessons', () => ({
  useSelectedCourseAndLessons: () => mockSelectedCourseAndLessons,
}));

const mockCourse = createRealisticCourseWithLessonsList()[0];

describe('component ReadOnlyLessonRangeSelector', () => {
  it('should render with course, from, and to', () => {
    overrideMockSelectedCourseAndLessons({
      course: mockCourse,
      fromLesson: mockCourse.lessons[0],
      toLesson: mockCourse.lessons[1],
    });
    render(<ReadOnlyLessonRangeSelector />);
    expect(screen.getByText('Course:')).toBeInTheDocument();
    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getByText('To:')).toBeInTheDocument();
    expect(screen.getByText('Lesson 1')).toBeInTheDocument();
    expect(screen.getByText('Lesson 2')).toBeInTheDocument();
  });

  it('should render with none selected if fromLesson is null', () => {
    // update mock to have fromLesson be null
    overrideMockSelectedCourseAndLessons({
      fromLesson: null,
    });
    render(<ReadOnlyLessonRangeSelector />);
    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getAllByText('none selected').length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it('should render with none selected if toLesson is null', () => {
    // update mock to have toLesson be null
    overrideMockSelectedCourseAndLessons({
      toLesson: null,
    });
    render(<ReadOnlyLessonRangeSelector />);
    expect(screen.getByText('To:')).toBeInTheDocument();
    expect(screen.getAllByText('none selected').length).toBeGreaterThanOrEqual(
      1,
    );
  });
});
