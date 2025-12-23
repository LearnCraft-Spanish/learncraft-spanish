import {
  overrideMockUseCoursesWithLessons,
  resetMockUseCoursesWithLessons,
} from '@application/queries/useCoursesWithLessons.mock';
import { useLocalFilterPanelLogic } from '@application/units/ExampleSearchInterface/Filters/useLocalFilterPanelLogic';
import { renderHook } from '@testing-library/react';
import { createMockCourseWithLessons } from '@testing/factories/courseFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the useCoursesWithLessons hook
vi.mock('@application/queries/useCoursesWithLessons', () => ({
  useCoursesWithLessons: () => overrideMockUseCoursesWithLessons({}),
}));

// Mock the domain functions
vi.mock('@domain/coursePrerequisites', () => ({
  generateVirtualLessonId: vi.fn((courseId: number, index: number) => {
    return -(courseId * 1000 + index + 1);
  }),
  getPrerequisitesForCourse: vi.fn((courseId: number) => {
    if (courseId === 5) {
      // Post-1MC Cohort has prerequisites
      return {
        targetCourseId: 5,
        targetCourseName: 'Post-1MC Cohort',
        prerequisites: [
          {
            courseId: 3,
            courseName: 'Spanish in One Month',
            fromLessonNumber: 1,
            toLessonNumber: 20,
            displayName: 'All si1m Lessons (1-20)',
          },
        ],
      };
    }
    return null;
  }),
}));

describe('useLocalFilterPanelLogic', () => {
  beforeEach(() => {
    resetMockUseCoursesWithLessons();
  });

  it('should find the correct course by ID', () => {
    // Arrange
    const mockCourses = [
      createMockCourseWithLessons({
        id: 2,
        name: 'LearnCraft Spanish',
        lessons: [
          { id: 1, lessonNumber: 1, courseName: 'LearnCraft Spanish' },
          { id: 2, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
        ],
      }),
      createMockCourseWithLessons({
        id: 3,
        name: 'Spanish in One Month',
        lessons: [
          { id: 10, lessonNumber: 1, courseName: 'Spanish in One Month' },
        ],
      }),
    ];

    overrideMockUseCoursesWithLessons({
      data: mockCourses,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useLocalFilterPanelLogic({
        selectedCourseId: 2,
        fromLessonNumber: 1,
        toLessonNumber: 2,
      }),
    );

    // Assert
    expect(result.current.course).toBeDefined();
    expect(result.current.course?.id).toBe(2);
    expect(result.current.course?.name).toBe('LearnCraft Spanish');
  });

  it('should find the correct toLesson and fromLesson', () => {
    // Arrange
    const mockCourses = [
      createMockCourseWithLessons({
        id: 2,
        name: 'LearnCraft Spanish',
        lessons: [
          { id: 1, lessonNumber: 1, courseName: 'LearnCraft Spanish' },
          { id: 2, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
          { id: 3, lessonNumber: 3, courseName: 'LearnCraft Spanish' },
        ],
      }),
    ];

    overrideMockUseCoursesWithLessons({
      data: mockCourses,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useLocalFilterPanelLogic({
        selectedCourseId: 2,
        fromLessonNumber: 1,
        toLessonNumber: 3,
      }),
    );

    // Assert
    expect(result.current.fromLesson).toBeDefined();
    expect(result.current.fromLesson?.lessonNumber).toBe(1);
    expect(result.current.toLesson).toBeDefined();
    expect(result.current.toLesson?.lessonNumber).toBe(3);
  });

  it('should generate fromLessons list filtered by toLesson', () => {
    // Arrange
    const mockCourses = [
      createMockCourseWithLessons({
        id: 2,
        name: 'LearnCraft Spanish',
        lessons: [
          { id: 1, lessonNumber: 1, courseName: 'LearnCraft Spanish' },
          { id: 2, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
          { id: 3, lessonNumber: 3, courseName: 'LearnCraft Spanish' },
          { id: 4, lessonNumber: 4, courseName: 'LearnCraft Spanish' },
        ],
      }),
    ];

    overrideMockUseCoursesWithLessons({
      data: mockCourses,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useLocalFilterPanelLogic({
        selectedCourseId: 2,
        fromLessonNumber: 1,
        toLessonNumber: 3,
      }),
    );

    // Assert
    // fromLessons should only include lessons up to and including the toLesson
    expect(result.current.fromLessons).toHaveLength(3);
    expect(result.current.fromLessons[0].lessonNumber).toBe(1);
    expect(result.current.fromLessons[1].lessonNumber).toBe(2);
    expect(result.current.fromLessons[2].lessonNumber).toBe(3);
  });

  it('should generate toLessons list filtered by fromLesson', () => {
    // Arrange
    const mockCourses = [
      createMockCourseWithLessons({
        id: 2,
        name: 'LearnCraft Spanish',
        lessons: [
          { id: 1, lessonNumber: 1, courseName: 'LearnCraft Spanish' },
          { id: 2, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
          { id: 3, lessonNumber: 3, courseName: 'LearnCraft Spanish' },
          { id: 4, lessonNumber: 4, courseName: 'LearnCraft Spanish' },
        ],
      }),
    ];

    overrideMockUseCoursesWithLessons({
      data: mockCourses,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useLocalFilterPanelLogic({
        selectedCourseId: 2,
        fromLessonNumber: 2,
        toLessonNumber: 4,
      }),
    );

    // Assert
    // toLessons should only include lessons from the fromLesson onwards
    expect(result.current.toLessons).toHaveLength(3);
    expect(result.current.toLessons[0].lessonNumber).toBe(2);
    expect(result.current.toLessons[1].lessonNumber).toBe(3);
    expect(result.current.toLessons[2].lessonNumber).toBe(4);
  });

  it('should include virtual lessons from prerequisites in fromLessons', () => {
    // Arrange
    const mockCourses = [
      createMockCourseWithLessons({
        id: 5,
        name: 'Post-1MC Cohort',
        lessons: [
          { id: 1, lessonNumber: 1, courseName: 'Post-1MC Cohort' },
          { id: 2, lessonNumber: 2, courseName: 'Post-1MC Cohort' },
        ],
      }),
    ];

    overrideMockUseCoursesWithLessons({
      data: mockCourses,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useLocalFilterPanelLogic({
        selectedCourseId: 5,
        fromLessonNumber: 1,
        toLessonNumber: 2,
      }),
    );

    // Assert
    // fromLessons should include virtual lesson + regular lessons
    expect(result.current.fromLessons.length).toBeGreaterThan(0);
    // First lesson should be the virtual prerequisite lesson
    expect(result.current.fromLessons[0].id).toBeLessThan(0);
    expect(result.current.fromLessons[0].courseName).toBe(
      'Spanish in One Month',
    );
  });

  it('should return default lessons for a course without prerequisites', () => {
    // Arrange
    const mockCourses = [
      createMockCourseWithLessons({
        id: 2,
        name: 'LearnCraft Spanish',
        lessons: [
          { id: 1, lessonNumber: 1, courseName: 'LearnCraft Spanish' },
          { id: 2, lessonNumber: 2, courseName: 'LearnCraft Spanish' },
        ],
      }),
    ];

    overrideMockUseCoursesWithLessons({
      data: mockCourses,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useLocalFilterPanelLogic({
        selectedCourseId: 2,
        fromLessonNumber: 1,
        toLessonNumber: 2,
      }),
    );

    // Get defaults for the same course
    const defaults = result.current.getDefaultLessonsForCourse(2);

    // Assert
    expect(defaults.defaultFromLesson).toBe(1);
    expect(defaults.defaultToLesson).toBe(2); // Last lesson of the course
  });

  it('should return default lessons for a course with prerequisites', () => {
    // Arrange
    const mockCourses = [
      createMockCourseWithLessons({
        id: 5,
        name: 'Post-1MC Cohort',
        lessons: [
          { id: 1, lessonNumber: 1, courseName: 'Post-1MC Cohort' },
          { id: 2, lessonNumber: 2, courseName: 'Post-1MC Cohort' },
        ],
      }),
    ];

    overrideMockUseCoursesWithLessons({
      data: mockCourses,
      isLoading: false,
      error: null,
    });

    // Act
    const { result } = renderHook(() =>
      useLocalFilterPanelLogic({
        selectedCourseId: 5,
        fromLessonNumber: 1,
        toLessonNumber: 2,
      }),
    );

    // Get defaults for course with prerequisites
    const defaults = result.current.getDefaultLessonsForCourse(5);

    // Assert
    // Should default to virtual lesson (negative number)
    expect(defaults.defaultFromLesson).toBeLessThan(0);
    expect(defaults.defaultToLesson).toBe(2); // Last lesson of the course
  });
});
