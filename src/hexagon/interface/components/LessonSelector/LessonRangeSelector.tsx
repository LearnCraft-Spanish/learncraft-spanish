import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { useMemo } from 'react';
import SelectCourse from './SelectCourse';
import SelectLesson from './SelectLesson';
import './LessonSelector.css';

export default function LessonRangeSelector(): React.JSX.Element {
  const {
    course,
    toLesson,
    fromLesson,
    updateUserSelectedCourseId,
    updateToLessonId,
    updateFromLessonId,
  } = useSelectedCourseAndLessons();

  const fromLessons = useMemo(() => {
    if (!course || !toLesson) {
      return [];
    }
    return course?.lessons.filter((lesson) => {
      return lesson.lessonNumber <= toLesson?.lessonNumber;
    });
  }, [course, toLesson]);

  const toLessons = useMemo(() => {
    if (!course || !fromLesson) {
      return [];
    }
    return course?.lessons.filter((lesson) => {
      return lesson.lessonNumber >= fromLesson?.lessonNumber;
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
            value={fromLesson?.id.toString() ?? '0'}
            onChange={(value: string) =>
              updateFromLessonId(Number.parseInt(value))
            }
            label="From"
            lessons={fromLessons ?? []}
          />
        )}
        <SelectLesson
          value={toLesson?.id.toString() ?? '0'}
          onChange={(value: string) => updateToLessonId(Number.parseInt(value))}
          label="To"
          lessons={toLessons ?? []}
        />
      </div>
    </div>
  );
}
