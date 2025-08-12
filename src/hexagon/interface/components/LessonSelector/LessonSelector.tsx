import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
// MOVE THIS INTO HEXAGON
import SelectCourse from './SelectCourse';
import SelectLesson from './SelectLesson';
import './LessonSelector.css';

export default function LessonSelector(): React.JSX.Element {
  const { course, toLesson, updateUserSelectedCourseId, updateToLessonNumber } =
    useSelectedCourseAndLessons();

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
          lessons={course.lessons}
        />
      )}
    </div>
  );
}
