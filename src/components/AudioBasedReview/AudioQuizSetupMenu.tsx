import { useEffect } from 'react'
import './AudioBasedReview.css'

import type { Lesson, Program } from '../../interfaceDefinitions'
import { FromToLessonSelector } from '../LessonSelector'
import MenuButton from '../MenuButton'

interface AudioQuizSetupMenuProps {
  selectedLesson: Lesson
  updateSelectedLesson: (lesson: string) => void
  selectedProgram: Program
  updateSelectedProgram: (program: string) => void
  // update logic so this is never null
  fromLesson: Lesson | null
  updatefromLesson: (lesson: string | number) => void
  autoplay: boolean
  updateAutoplay: (autoplay: string) => void
  examplesToPlayLength: number
  readyQuiz: () => void
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
  fromLesson,
  updatefromLesson,
}: AudioQuizSetupMenuProps): JSX.Element {
  function updateAutoplayWorkaround(autoplay: boolean) {
    if (autoplay) {
      updateAutoplay('on')
    }
    else {
      updateAutoplay('off')
    }
  }
  useEffect(() => {
    if (selectedProgram && !fromLesson) {
      updatefromLesson(selectedProgram.lessons[0].recordId)
    }
  }, [fromLesson, updatefromLesson, selectedProgram])
  return (
    <div className="audioQuizSetupMenu">
      {/* Change className? currently confusing */}
      <div className="form">
        <FromToLessonSelector
          selectedProgram={selectedProgram}
          updateSelectedProgram={updateSelectedProgram}
          fromLesson={fromLesson}
          updateFromLesson={updatefromLesson}
          toLesson={selectedLesson}
          updateToLesson={updateSelectedLesson}
        />
        <div className="menuRow">
          <p>Autoplay:</p>
          <label htmlFor="isAutoplay" className="switch">
            <input type="checkbox" name="isAutoplay" id="isAutoplay" checked={autoplay} onChange={e => updateAutoplayWorkaround(e.target.checked)} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="buttonBox">
        <MenuButton />
        <button type="button" onClick={readyQuiz} disabled={!(examplesToPlayLength > 0)}>Start</button>
      </div>
      <div className="buttonBox">
        {examplesToPlayLength < 1
          ? <p>There are no audio examples for this lesson range</p>
          : <p>{`${examplesToPlayLength} examples found`}</p>}
      </div>
    </div>
  )
}
