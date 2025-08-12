import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { LessonSelector } from '../LessonSelector';
export default function FrequensaySetup({
  isFrequensayEnabled,
  setIsFrequensayEnabled,
}: {
  isFrequensayEnabled: boolean;
  setIsFrequensayEnabled: (value: boolean) => void;
}) {
  const { course, toLesson } = useSelectedCourseAndLessons();

  return (
    <div className="frequensay-page__setup">
      <LessonSelector />
      {!isFrequensayEnabled && (
        <>
          {!toLesson && (
            <div className="frequensay-setup__error">
              Please select a course and lesson range to enable Frequensay
            </div>
          )}
          <button
            className="frequensay-setup__button"
            type="button"
            disabled={!course || !toLesson || toLesson.lessonNumber === 0}
            onClick={() => setIsFrequensayEnabled(!isFrequensayEnabled)}
          >
            Enable Frequensay
          </button>
        </>
      )}
    </div>
  );
}
