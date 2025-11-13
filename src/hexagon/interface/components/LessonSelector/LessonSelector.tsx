import type { ExtendedLesson } from '@interface/components/LessonSelector/SelectLesson';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import {
  generateVirtualLessonId,
  getPrerequisitesForCourse,
} from '@domain/coursePrerequisites';
import SelectCourse from '@interface/components/LessonSelector/SelectCourse';
import SelectLesson from '@interface/components/LessonSelector/SelectLesson';
import { useMemo } from 'react';
import './LessonSelector.css';

export default function LessonSelector(): React.JSX.Element {
  const { course, toLesson, updateUserSelectedCourseId, updateToLessonNumber } =
    useSelectedCourseAndLessons();

  const availableLessons = useMemo((): ExtendedLesson[] => {
    if (!course) {
      return [];
    }

    let lessons: ExtendedLesson[] = [...course.lessons];

    // Always add virtual prerequisite lessons for courses that have them
    const prerequisites = getPrerequisitesForCourse(course.id);
    if (prerequisites) {
      const virtualLessons: ExtendedLesson[] = prerequisites.prerequisites.map(
        (prereq, index) => ({
          id: generateVirtualLessonId(course.id, index),
          lessonNumber: generateVirtualLessonId(course.id, index),
          courseName: prereq.courseName,
          isVirtual: true,
          displayName: prereq.displayName,
        }),
      );

      // Add virtual lessons at the beginning
      lessons = [...virtualLessons, ...lessons];
    }

    return lessons;
  }, [course]);

  return (
    <div className="FTLS">
      <SelectCourse
        value={course?.id.toString() ?? '0'}
        onChange={(value: string) =>
          updateUserSelectedCourseId(Number.parseInt(value))
        }
      />
      {course?.lessons && (
        <SelectLesson
          value={toLesson?.lessonNumber.toString() ?? '0'}
          onChange={(value: string) =>
            updateToLessonNumber(Number.parseInt(value))
          }
          id="toLesson"
          label="Lesson"
          lessons={availableLessons}
        />
      )}
    </div>
  );
}
