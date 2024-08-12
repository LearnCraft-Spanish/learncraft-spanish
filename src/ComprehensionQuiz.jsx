import React, { useEffect } from 'react'

import './App.css'

import AudioBasedReview from './AudioBasedReview'

export default function ComprehensionQuiz({
  programTable,
  activeStudent,
  studentExamplesTable,
  updateBannerMessage,
  audioExamplesTable,
  filterExamplesByAllowedVocab,
  selectedLesson,
  selectedProgram,
  updateSelectedLesson,
  updateSelectedProgram,
}) {
  const rendered = false

  useEffect(() => {
    if (!rendered) {
      rendered.current = true
    }
  }, [])

  return (
    <div className="quiz">
      <h2 className="comprehensionHeader">Comprehension Quiz</h2>
      <AudioBasedReview
        activeStudent={activeStudent}
        programTable={programTable}
        studentExamplesTable={studentExamplesTable}
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
