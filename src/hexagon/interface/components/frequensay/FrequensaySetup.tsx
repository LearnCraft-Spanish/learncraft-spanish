import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import { FrequensayIncludeUnpublishedToggle } from '@interface/components/frequensay/FrequensayIncludeUnpublishedToggle';
import { LessonSelector } from '@interface/components/LessonSelector';
import { InlineLoading } from '@interface/components/Loading';
export default function FrequensaySetup({
  isLoading,
  isFrequensayEnabled,
  setIsFrequensayEnabled,
}: {
  isLoading: boolean;
  isFrequensayEnabled: boolean;
  setIsFrequensayEnabled: (value: boolean) => void;
}) {
  const { course, toLesson } = useSelectedCourseAndLessons();

  return (
    <div className="frequensay-page__setup">
      <FrequensayIncludeUnpublishedToggle />
      {isLoading ? (
        <InlineLoading message="Loading courses and lessons..." />
      ) : (
        <>
          <LessonSelector />
        </>
      )}
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
