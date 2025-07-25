import type { ReactElement } from 'react';
import type { Program } from 'src/types/interfaceDefinitions';
import { useSelectedCourseAndLessons } from '@application/coordinators/hooks/useSelectedCourseAndLessons';
import React from 'react';
import { useProgramTable } from 'src/hooks/CourseData/useProgramTable';
import './LessonSelector.css';

export default function FromToLessonSelector(): React.JSX.Element {
  // const {
  //   selectedProgram,
  //   selectedFromLesson,
  //   selectedToLesson,
  //   setProgram,
  //   setFromLesson,
  //   setToLesson,
  // } = useSelectedLesson();
  const {
    course,
    fromLesson,
    toLesson,
    updateUserSelectedCourseId,
    updateFromLessonId,
    updateToLessonId,
  } = useSelectedCourseAndLessons();
  const { programTableQuery } = useProgramTable();

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
    const lessonSelector: Array<React.JSX.Element> = [];
    const toLessonNumber = toLesson?.lessonNumber;
    // Foreign Key lookup, form data in backend
    course?.lessons.forEach((lesson) => {
      const lessonNumber = lesson.lessonNumber;
      if (lessonNumber && (!toLessonNumber || lessonNumber <= toLessonNumber)) {
        lessonSelector.push(
          <option key={lesson.id} value={lesson.id}>
            {`Lesson ${lessonNumber}`}
          </option>,
        );
      }
    });
    return lessonSelector;
  }

  function makeToLessonSelector() {
    const lessonSelector: Array<React.JSX.Element> = [];
    const fromLessonNumber = fromLesson?.lessonNumber;
    // Foreign Key lookup, form data in backend
    course?.lessons.forEach((lesson) => {
      const lessonNumber = lesson.lessonNumber;
      if (
        lessonNumber &&
        (!fromLessonNumber || lessonNumber >= fromLessonNumber)
      ) {
        lessonSelector.push(
          <option key={lesson.id} value={lesson.id}>
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
          value={course?.id ?? 0}
          onChange={(e) =>
            updateUserSelectedCourseId(Number.parseInt(e.target.value))
          }
        >
          <option key={0} value={0}>
            –Choose Course–
          </option>
          {makeCourseSelector()}
        </select>
      </label>
      <div>
        {course?.lessons && (
          <label htmlFor="fromLesson" className="menuRow" id="fromRow">
            <p>From:</p>

            <select
              id="fromLesson"
              name="fromLesson"
              value={fromLesson?.id ?? 0}
              onChange={(e) =>
                updateFromLessonId(Number.parseInt(e.target.value))
              }
            >
              <option key={0} value={0}>
                –Choose Lesson–
              </option>
              {makeFromLessonSelector()}
            </select>
          </label>
        )}
        {course?.lessons && (
          <label htmlFor="toLesson" className="menuRow" id="toRow">
            <p>To:</p>

            <select
              id="toLesson"
              name="toLesson"
              className="lessonList"
              value={toLesson?.id ?? 0}
              onChange={(e) =>
                updateToLessonId(Number.parseInt(e.target.value))
              }
            >
              <option key={0} value={0}>
                –Choose Lesson–
              </option>
              {makeToLessonSelector()}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
