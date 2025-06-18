import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
// MOVE THIS INTO HEXAGON
import SelectCourse from './SelectCourse';
import SelectLesson from './SelectLesson';
import './LessonSelector.css';

export default function LessonSelector(): React.JSX.Element {
  const { course, toLesson, updateCourse, updateToLesson } =
    useSelectedCourseAndLessons();

  return (
    <div className="FTLS">
      <SelectCourse
        value={course?.id.toString() ?? '0'}
        onChange={(value: string) => updateCourse(Number.parseInt(value))}
      />
      {course?.lessons && (
        <SelectLesson
          value={toLesson?.id.toString() ?? '0'}
          onChange={(value: string) => updateToLesson(Number.parseInt(value))}
          label="Lesson"
          lessons={course.lessons}
        />
      )}
    </div>
  );
}
