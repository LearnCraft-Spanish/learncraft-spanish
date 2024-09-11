import LessonSelector from '../../LessonSelector'
import type { Lesson, Program } from '../../interfaceDefinitions'
import './AudioBasedReview.css'

interface AudioQuizSetupMenuProps {
  selectedLesson: Lesson
  updateSelectedLesson: (lesson: string) => void
  selectedProgram: Program
  updateSelectedProgram: (program: string) => void
  autoplay: boolean
  updateAutoplay: (autoplay: string) => void
  examplesToPlayLength: number
  readyQuiz: () => void
  audioOrComprehension: string
}
export default function AudioQuizSetupMenu({
  selectedLesson,
  updateSelectedLesson,
  selectedProgram,
  updateSelectedProgram,
  autoplay,
  updateAutoplay,
  examplesToPlayLength,
  readyQuiz,
  audioOrComprehension,
}: AudioQuizSetupMenuProps): JSX.Element {
  function updateAutoplayWorkaround(autoplay: boolean) {
    if (autoplay) {
      updateAutoplay('on')
    }
    else {
      updateAutoplay('off')
    }
  }
  return (
    <div className="audioBox">
      <LessonSelector
        selectedLesson={selectedLesson}
        updateSelectedLesson={updateSelectedLesson}
        selectedProgram={selectedProgram}
        updateSelectedProgram={updateSelectedProgram}
      />
      {audioOrComprehension === 'comprehension' && (
        <div className="menuRow">
          <p>Autoplay:</p>
          <label htmlFor="isAutoplay" className="switch">
            <input type="checkbox" name="isAutoplay" id="isAutoplay" checked={autoplay} onChange={e => updateAutoplayWorkaround(e.target.checked)} />
            <span className="slider round"></span>
          </label>
        </div>
      )}
      <div className="buttonBox">
        <button type="button" onClick={readyQuiz} disabled={!(examplesToPlayLength > 0)}>Start</button>
      </div>
      <div className="buttonBox">
        {examplesToPlayLength < 1 && (
          <p>There are no audio examples for this comprehension level</p>
        )}
      </div>
    </div>
  )
}