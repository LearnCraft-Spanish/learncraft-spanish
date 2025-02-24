import { useProgramTable } from 'src/hooks/CourseData/useProgramTable';
import { useSelectedLesson } from 'src/hooks/useSelectedLesson';
import type { Lesson, Program } from 'src/types/interfaceDefinitions';
import './LessonSelector.css';
import type { ReactElement } from 'react';

export default function FromToLessonSelector(): JSX.Element {
  const {
    selectedProgram,
    selectedFromLesson,
    selectedToLesson,
    setProgram,
    setFromLesson,
    setToLesson,
  } = useSelectedLesson();
  const { programTableQuery } = useProgramTable();
  // Helper Function
  function getLessonNumber(lesson: Lesson | null): number | null {
    if (!lesson?.lesson) {
      return null;
    }
    const lessonArray = lesson.lesson.split(' ');
    const lessonNumberString = lessonArray.slice(-1)[0];
    const lessonNumber = Number.parseInt(lessonNumberString, 10);
    return lessonNumber;
  }

  function makeCourseSelector() {
    const courseSelector: ReactElement[] = [];
    if (programTableQuery.isSuccess) {
      programTableQuery.data?.forEach((item: Program) => {
        courseSelector.push(
          <option key={item.recordId} value={item.recordId}>
            {item.name}
          </option>,
        );
      });
    }
    return courseSelector;
  }

  function makeFromLessonSelector() {
    const lessonSelector: Array<JSX.Element> = [];
    const toLessonNumber = getLessonNumber(selectedToLesson);
    selectedProgram?.lessons.forEach((lesson: Lesson) => {
      const lessonNumber = getLessonNumber(lesson);
      if (lessonNumber && (!toLessonNumber || lessonNumber <= toLessonNumber)) {
        lessonSelector.push(
          <option key={lesson.lesson} value={lesson.recordId}>
            {`Lesson ${lessonNumber}`}
          </option>,
        );
      }
    });
    return lessonSelector;
  }

  function makeToLessonSelector() {
    const lessonSelector: Array<JSX.Element> = [];
    const fromLessonNumber = getLessonNumber(selectedFromLesson);
    selectedProgram?.lessons.forEach((lesson: Lesson) => {
      const lessonNumber = getLessonNumber(lesson);
      if (
        lessonNumber &&
        (!fromLessonNumber || lessonNumber >= fromLessonNumber)
      ) {
        lessonSelector.push(
          <option key={lesson.lesson} value={lesson.recordId}>
            {`Lesson ${lessonNumber}`}
          </option>,
        );
      }
    });
    return lessonSelector;
  }

  return (
    <div className="FTLS">
      <label htmlFor="courseList" className="menuRow" id="courseRow">
        <p>Course:</p>
        <select
          id="courseList"
          name="courseList"
          className="courseList"
          value={selectedProgram?.recordId ? selectedProgram?.recordId : 0}
          onChange={(e) => setProgram(e.target.value)}
        >
          <option key={0} value={0}>
            –Choose Course–
          </option>
          {makeCourseSelector()}
        </select>
      </label>
      <div>
        {selectedProgram?.lessons && (
          <label htmlFor="fromLesson" className="menuRow" id="fromRow">
            <p>From:</p>

            <select
              id="fromLesson"
              name="fromLesson"
              value={selectedFromLesson?.recordId}
              onChange={(e) => setFromLesson(e.target.value)}
            >
              <option key={0} value={0}>
                –Choose Lesson–
              </option>
              {makeFromLessonSelector()}
            </select>
          </label>
        )}
        {selectedProgram?.lessons && (
          <label htmlFor="toLesson" className="menuRow" id="toRow">
            <p>To:</p>

            <select
              id="toLesson"
              name="toLesson"
              className="lessonList"
              value={selectedToLesson?.recordId}
              onChange={(e) => setToLesson(e.target.value)}
            >
              {makeToLessonSelector()}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
