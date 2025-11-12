import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import './LessonSelector.css';

export default function ReadOnlyLessonRangeSelector(): React.JSX.Element {
  const { course, toLesson, fromLesson } = useSelectedCourseAndLessons();
  return (
    <div className="FTLS">
      <div>
        <h4>Course:</h4>
        <p>{course?.name}</p>
      </div>
      <div>
        <div>
          <h4>From:</h4>
          {fromLesson ? (
            <p>{`Lesson ${fromLesson?.lessonNumber}`}</p>
          ) : (
            <p>none selected</p>
          )}
        </div>
        <div>
          <h4>To:</h4>
          {toLesson ? (
            <p>{`Lesson ${toLesson?.lessonNumber}`}</p>
          ) : (
            <p>none selected</p>
          )}
        </div>
      </div>
    </div>
  );
}
