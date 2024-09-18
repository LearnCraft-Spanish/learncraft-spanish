import React from 'react'

import './LessonSelector.css'
import type { Lesson, Program } from '../../interfaceDefinitions'
import { useProgramTable } from '../../hooks/useProgramTable'

interface LessonSelectorProps {
  selectedLesson: Lesson | null
  updateSelectedLesson: (lessonId: string) => void
  selectedProgram: Program | null
  updateSelectedProgram: (programId: string) => void
}
export default function LessonSelector({
  selectedLesson,
  updateSelectedLesson,
  selectedProgram,
  updateSelectedProgram,
}: LessonSelectorProps) {
  const { programTableQuery } = useProgramTable()
  function makeCourseSelector() {
    const courseSelector = [
      <option key={0} value={0}>
        –Choose Course–
      </option>,
    ]
    if (programTableQuery.isSuccess) {
      programTableQuery.data?.forEach((item: Program) => {
        courseSelector.push(
          <option key={item.recordId} value={item.recordId}>
            {item.name}
          </option>,
        )
      })
    }
    return courseSelector
  }

  function makeLessonSelector() {
    const lessonSelector: Array<JSX.Element> = []
    selectedProgram?.lessons.forEach((lesson: Lesson) => {
      const lessonArray = lesson.lesson.split(' ')
      const lessonNumber = lessonArray.slice(-1)[0]
      lessonSelector.push(
        <option key={lesson.lesson} value={lesson.recordId}>
          {`Lesson ${lessonNumber}`}
        </option>,
      )
    })
    return lessonSelector
  }

  return (
    <div>
      <div className="lessonFilter">
        <h3>Set Level</h3>
        <form onSubmit={e => e.preventDefault}>
          <div className="">
            <select
              className="courseList"
              value={selectedProgram?.recordId}
              onChange={e => updateSelectedProgram(e.target.value)}
            >
              {makeCourseSelector()}
            </select>
          </div>
          {selectedLesson?.recordId && selectedProgram?.lessons && (
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
