// MOVE THIS INTO HEXAGON
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import SelectCourse from './SelectCourse';
import SelectLesson from './SelectLesson';
import './LessonSelector.css';

export default function LessonSelector(): React.JSX.Element {
  const { selectedProgram, selectedToLesson, setProgram, setToLesson } =
    useSelectedLesson();

  return (
    <div className="FTLS">
      <SelectCourse
        value={selectedProgram?.recordId.toString() ?? '0'}
        onChange={(value: string) => setProgram(value)}
      />
      {selectedProgram?.lessons && (
        <SelectLesson
          value={selectedToLesson?.recordId.toString() ?? '0'}
          onChange={(value: string) => setToLesson(value)}
          label="Lesson"
          lessons={selectedProgram.lessons}
        />
      )}
    </div>
  );
}
