import React, { useEffect, useRef } from 'react'

import './App.css'

import AudioBasedReview from './AudioBasedReview'
import { useActiveStudent } from './hooks/useActiveStudent'

export default function ComprehensionQuiz({
  updateBannerMessage,
  filterExamplesByAllowedVocab,
  selectedLesson,
  selectedProgram,
  updateSelectedLesson,
  updateSelectedProgram,
}) {
  const { activeStudent, studentFlashcardData, audioExamplesTable, programTable } = useActiveStudent()
  const rendered = useRef(false)

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
  }, [])

  return (
    <div className="quiz">
      <h2 className="comprehensionHeader">Comprehension Quiz</h2>
      <AudioBasedReview
        activeStudent={activeStudent}
        programTable={programTable}
        studentExamplesTable={studentFlashcardData.studentExamples}
        updateBannerMessage={updateBannerMessage}
        audioExamplesTable={audioExamplesTable}
        filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}
        willAutoplay={false}
        willStartWithSpanish
        selectedLesson={selectedLesson}
        selectedProgram={selectedProgram}
        updateSelectedLesson={updateSelectedLesson}
        updateSelectedProgram={updateSelectedProgram}
      />
    </div>
  )
}
