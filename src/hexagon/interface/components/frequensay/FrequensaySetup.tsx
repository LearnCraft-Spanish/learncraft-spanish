import { FromToLessonSelector } from 'src/components/LessonSelector';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';

export default function FrequensaySetup() {
  const { selectedProgram, selectedToLesson } = useSelectedLesson();

  const dataReady = selectedProgram && selectedToLesson;
  return (
    <div className="frequensay-page__setup">
      <FromToLessonSelector />
      {!dataReady && (
        <div className="frequensaySetup__error">
          Please select a course and lesson range to enable Frequensay
        </div>
      )}
    </div>
  );
}
