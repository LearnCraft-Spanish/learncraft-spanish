import React from 'react';
import { program, lesson } from './interfaceDefinitions';

export default function LessonSelector(
  programTable: Array<program>,
  selectedLesson: lesson | null,
  updateSelectedLesson: Function,
  selectedProgram: program,
  updateSelectedProgram: Function,
) {
  function makeCourseSelector() {
    const courseSelector = [
      <option key={0} value={0}>
        –Choose Course–
      </option>,
    ];
    programTable.forEach((item: program) => {
      courseSelector.push(
        <option key={item.recordId} value={item.recordId}>
          {' '}
          {item.name}
        </option>,
      );
    });
    return courseSelector;
  }

  function makeLessonSelector() {
    const lessonSelector: Array<JSX.Element> = [];
    selectedProgram.lessons.forEach((lesson: lesson) => {
      const lessonArray = lesson.lesson.split(' ');
      const lessonNumber = lessonArray.slice(-1)[0];
      lessonSelector.push(
        <option key={lesson.lesson} value={lesson.recordId}>
          {' '}
          Lesson {lessonNumber}
        </option>,
      );
    });
    return lessonSelector;
  }

  return (
    <div>
      <div className="lessonFilter">
        <form onSubmit={(e) => e.preventDefault}>
          <h3>Set Level</h3>
          <select
            className="courseList"
            value={selectedProgram.recordId}
            onChange={(e) => updateSelectedProgram(e.target.value)}
          >
            {makeCourseSelector()}
          </select>
          {selectedLesson && selectedProgram.lessons && (
            <select
              className="lessonList"
              value={selectedLesson.recordId}
              onChange={(e) => updateSelectedLesson(e.target.value)}
            >
              {makeLessonSelector()}
            </select>
          )}
        </form>
      </div>
    </div>
  );
}
