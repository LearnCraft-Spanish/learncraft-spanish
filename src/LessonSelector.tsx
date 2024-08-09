import React from 'react'

import type { Lesson, Program } from './interfaceDefinitions'

interface LessonSelectorProps {
  programTable: Array<Program>
  selectedLesson: Lesson | null
  updateSelectedLesson: (lessonId: string | null) => void
  selectedProgram: Program
  updateSelectedProgram: (programId: string) => void
}
export default function LessonSelector({
  programTable,
  selectedLesson,
  updateSelectedLesson,
  selectedProgram,
  updateSelectedProgram,
}: LessonSelectorProps) {
  function makeCourseSelector() {
    const courseSelector = [
      <option key={0} value={0}>
        –Choose Course–
      </option>,
    ]
    programTable.forEach((item: Program) => {
      courseSelector.push(
        <option key={item.recordId} value={item.recordId}>
          {' '}
          {item.name}
        </option>,
      )
    })
    return courseSelector
  }

  function makeLessonSelector() {
    const lessonSelector: Array<JSX.Element> = []
    selectedProgram.lessons.forEach((lesson: Lesson) => {
      const lessonArray = lesson.lesson.split(' ')
      const lessonNumber = lessonArray.slice(-1)[0]
      lessonSelector.push(
        <option key={lesson.lesson} value={lesson.recordId}>
          {' '}
          Lesson
          {' '}
          {lessonNumber}
        </option>,
      )
    })
    return lessonSelector
  }

  return (
    <div>
      <div className="lessonFilter">
        <form onSubmit={e => e.preventDefault}>
          <h3>Set Level</h3>
          <select
            className="courseList"
            value={selectedProgram?.recordId}
            onChange={e => updateSelectedProgram(e.target.value)}
          >
            {makeCourseSelector()}
          </select>
          {selectedLesson && selectedProgram.lessons && (
            <select
              className="lessonList"
              value={selectedLesson.recordId}
              onChange={e => updateSelectedLesson(e.target.value)}
            >
              {makeLessonSelector()}
            </select>
          )}
        </form>
      </div>
    </div>
  )
}
