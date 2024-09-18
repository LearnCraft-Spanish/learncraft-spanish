import type { Lesson, Program } from '../../interfaceDefinitions'
import { useActiveStudent } from '../../hooks/useActiveStudent'
import { useProgramTable } from '../../hooks/useProgramTable'
import './LessonSelector.css'

interface LessonSelectorProps {
  selectedProgram: Program | null
  updateSelectedProgram: (programId: string) => void
  fromLesson: Lesson | null
  updateFromLesson: (lessonId: string) => void
  toLesson: Lesson | null
  updateToLesson: (lessonId: string) => void
}

export default function FromToLessonSelector({
  selectedProgram,
  updateSelectedProgram,
  fromLesson,
  updateFromLesson,
  toLesson,
  updateToLesson,

}: LessonSelectorProps): JSX.Element {
  const { programTableQuery } = useProgramTable()
  // This is the same code as in LessonSelector.tsx
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
    <div className="FTLS">
      <label htmlFor="courseList" className="menuRow" id="courseRow">
        <p>Course:</p>
        <select
          id="courseList"
          name="courseList"
          className="courseList"
          value={selectedProgram?.recordId}
          onChange={e => updateSelectedProgram(e.target.value)}
        >
          {makeCourseSelector()}
        </select>
      </label>
      <div id="flashcardFinderStyling">
        <label htmlFor="fromLesson" className="menuRow" id="fromRow">
          <p>From:</p>
          {fromLesson?.recordId && selectedProgram?.lessons && (
            <select
              id="fromLesson"
              name="fromLesson"
              className="lessonList"
              value={fromLesson.recordId}
              onChange={e => updateFromLesson(e.target.value)}
            >
              {makeLessonSelector()}
            </select>
          )}
        </label>
        <label htmlFor="toLesson" className="menuRow" id="toRow">
          <p>To:</p>
          {toLesson?.recordId && selectedProgram?.lessons && (
            <select
              id="toLesson"
              name="toLesson"
              className="lessonList"
              value={toLesson.recordId}
              onChange={e => updateToLesson(e.target.value)}
            >
              {makeLessonSelector()}
            </select>
          )}
        </label>
      </div>
    </div>
  )
}
