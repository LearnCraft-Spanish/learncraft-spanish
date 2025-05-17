import { useMemo } from 'react';
// MOVE THIS INTO HEXAGON
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import { getLessonNumber } from './helpers';
import SelectCourse from './SelectCourse';
import SelectLesson from './SelectLesson';
import './LessonSelector.css';

export default function LessonRangeSelector(): React.JSX.Element {
  const {
    selectedProgram,
    selectedToLesson,
    selectedFromLesson,
    setProgram,
    setToLesson,
    setFromLesson,
  } = useSelectedLesson();

  const fromLessons = useMemo(() => {
    const toLessonNumber = getLessonNumber(selectedToLesson);
    if (!toLessonNumber) {
      return [];
    }
    return selectedProgram?.lessons.filter((lesson) => {
      const lessonNumber = getLessonNumber(lesson);
      if (!lessonNumber) {
        return false;
      }
      return lessonNumber <= toLessonNumber;
    });
  }, [selectedProgram, selectedToLesson]);

  const toLessons = useMemo(() => {
    const fromLessonNumber = getLessonNumber(selectedFromLesson);
    if (!fromLessonNumber) {
      return [];
    }
    return selectedProgram?.lessons.filter((lesson) => {
      const lessonNumber = getLessonNumber(lesson);
      if (!lessonNumber) {
        return false;
      }
      return lessonNumber >= fromLessonNumber;
    });
  }, [selectedProgram, selectedFromLesson]);

  return (
    <div className="FTLS">
      <SelectCourse
        value={selectedProgram?.recordId.toString() ?? '0'}
        onChange={(value: string) => setProgram(value)}
      />
      <div>
        {selectedProgram?.lessons && (
          <SelectLesson
            value={selectedFromLesson?.recordId.toString() ?? '0'}
            onChange={(value: string) => setFromLesson(value)}
            label="From"
            lessons={fromLessons ?? []}
          />
        )}
        <SelectLesson
          value={selectedToLesson?.recordId.toString() ?? '0'}
          onChange={(value: string) => setToLesson(value)}
          label="To"
          lessons={toLessons ?? []}
        />
      </div>
    </div>
  );
}
