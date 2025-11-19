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

export default function LessonRangeSelector(): React.JSX.Element {
  const {
    course,
    toLesson,
    fromLesson,
    updateUserSelectedCourseId,
    updateToLessonNumber,
    updateFromLessonNumber,
  } = useSelectedCourseAndLessons();

  const fromLessons = useMemo((): ExtendedLesson[] => {
    if (!course) {
      return [];
    }

    const prerequisites = getPrerequisitesForCourse(course.id);
    const virtualLessons: ExtendedLesson[] = prerequisites
      ? prerequisites.prerequisites.map((prereq, index) => ({
          id: generateVirtualLessonId(course.id, index),
          lessonNumber: generateVirtualLessonId(course.id, index),
          courseName: prereq.courseName,
          isVirtual: true,
          displayName: prereq.displayName,
        }))
      : [];

    // If no "To" lesson is selected, only show prerequisite options
    if (!toLesson) {
      return virtualLessons;
    }

    // If "To" lesson is selected, show prerequisites + filtered regular lessons
    const filteredLessons = course.lessons.filter(
      (lesson) => lesson.lessonNumber <= toLesson.lessonNumber,
    );

    return [...virtualLessons, ...filteredLessons];
  }, [course, toLesson]);

  const toLessons = useMemo((): ExtendedLesson[] => {
    if (!course) {
      return [];
    }
    if (!fromLesson) {
      return course.lessons;
    }

    // If fromLesson is virtual, show all lessons in the target course
    if (fromLesson.lessonNumber < 0) {
      return course.lessons;
    }

    return course.lessons.filter((lesson) => {
      return lesson.lessonNumber >= fromLesson.lessonNumber;
    });
  }, [course, fromLesson]);

  return (
    <div className="FTLS">
      <SelectCourse
        value={course?.id.toString() ?? '0'}
        onChange={(value: string) =>
          updateUserSelectedCourseId(Number.parseInt(value))
        }
      />
      <div>
        {course?.lessons && (
          <SelectLesson
            value={fromLesson?.lessonNumber.toString() ?? '0'}
            onChange={(value: string) =>
              updateFromLessonNumber(Number.parseInt(value))
            }
            label="From"
            id="fromLesson"
            lessons={fromLessons ?? []}
          />
        )}
        <SelectLesson
          value={toLesson?.lessonNumber.toString() ?? '0'}
          onChange={(value: string) =>
            updateToLessonNumber(Number.parseInt(value))
          }
          label="To"
          id="toLesson"
          lessons={toLessons ?? []}
          required
        />
      </div>
    </div>
  );
}
