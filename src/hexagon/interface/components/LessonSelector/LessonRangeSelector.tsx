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
    updateToLessonNumber,
    updateFromLessonNumber,
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
    if (!course) {
      return [];
    }
    if (!fromLesson) {
      return course?.lessons;
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
