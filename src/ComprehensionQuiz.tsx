import React, { useEffect, useRef } from 'react'

import './App.css'

import AudioBasedReview from './AudioBasedReview'
import type { Flashcard, Lesson, Program } from './interfaceDefinitions'

interface ComprehensionQuizProps {
  updateBannerMessage: (message: string) => void
  filterExamplesByAllowedVocab: (examples: Flashcard[], lessonId: number) => Flashcard[]
  selectedLesson: Lesson | null
  selectedProgram: Program | null
  updateSelectedLesson: (lessonId: string) => void
  updateSelectedProgram: (programId: string) => void
}

export default function ComprehensionQuiz({
  updateBannerMessage,
  filterExamplesByAllowedVocab,
  selectedLesson,
  selectedProgram,
  updateSelectedLesson,
  updateSelectedProgram,
}: ComprehensionQuizProps) {
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
