import React, { useEffect, useRef } from 'react'
import './App.css'

import AudioBasedReview from './AudioBasedReview'
import type { Flashcard, Lesson, Program } from './interfaceDefinitions'

interface AudioQuizProps {
  updateBannerMessage: (message: string) => void
  filterExamplesByAllowedVocab: (examples: Flashcard[], lessonId: number) => Flashcard[]
  selectedLesson: Lesson | null
  selectedProgram: Program | null
  updateSelectedLesson: (lessonId: string) => void
  updateSelectedProgram: (programId: string) => void
}

export default function AudioQuiz({
  updateBannerMessage,
  filterExamplesByAllowedVocab,
  selectedLesson,
  selectedProgram,
  updateSelectedLesson,
  updateSelectedProgram,
}: AudioQuizProps) {
  const rendered = useRef(false)

  useEffect(() => {
    if (!rendered.current) {
      rendered.current = true
    }
  }, [])

  return (
    <div>
      <h2 className="comprehensionHeader">Audio Quiz</h2>
      <AudioBasedReview
        filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}
        willAutoplay
        willStartWithSpanish={false}
        selectedLesson={selectedLesson}
        selectedProgram={selectedProgram}
        updateSelectedLesson={updateSelectedLesson}
        updateSelectedProgram={updateSelectedProgram}
      />
    </div>
  )
}
