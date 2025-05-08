import { FromToLessonSelector } from 'src/components/LessonSelector';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';

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
      <FromToLessonSelector />
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
            disabled={!selectedProgram || !selectedToLesson}
            onClick={() => setIsFrequensayEnabled(!isFrequensayEnabled)}
          >
            {isFrequensayEnabled ? 'Disable Frequensay' : 'Enable Frequensay'}
          </button>
        </>
      )}
    </div>
  );
}
