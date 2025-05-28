import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import { LessonSelector } from '../LessonSelector';
export default function FrequensaySetup({
  isFrequensayEnabled,
  setIsFrequensayEnabled,
}: {
  isFrequensayEnabled: boolean;
  setIsFrequensayEnabled: (value: boolean) => void;
}) {
  const { selectedProgram, selectedToLesson } = useSelectedLesson();

  return (
    <div className="frequensay-page__setup">
      <LessonSelector />
      {!isFrequensayEnabled && (
        <>
          {!selectedToLesson ? (
            <div className="frequensay-setup__error">
              Please select a course and lesson range to enable Frequensay
            </div>
          ) : (
            <div className="frequensay-setup__instructions">
              Please confirm the lesson range before enabling Frequensay
            </div>
          )}
          <button
            className="frequensay-setup__button"
            type="button"
            disabled={
              !selectedProgram ||
              !selectedToLesson ||
              selectedToLesson.lessonNumber === 0
            }
            onClick={() => setIsFrequensayEnabled(!isFrequensayEnabled)}
          >
            Enable Frequensay
          </button>
        </>
      )}
    </div>
  );
}
