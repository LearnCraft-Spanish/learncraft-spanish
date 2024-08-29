import React, { useEffect, useState } from 'react'
import './App.css'

import AudioBasedReview from './AudioBasedReview'
import { useActiveStudent } from './hooks/useActiveStudent'
/*
    updateBannerMessage={updateBannerMessage}
                filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}

                selectedLesson={selectedLesson}
                selectedProgram={selectedProgram}
                updateSelectedLesson={updateSelectedLesson}
                updateSelectedProgram={updateSelectedProgram}
                */
export default function AudioQuiz({
  updateBannerMessage,
  filterExamplesByAllowedVocab,
  selectedLesson,
  selectedProgram,
  updateSelectedLesson,
  updateSelectedProgram,
}) {
  const { activeStudent, audioExamplesTable, studentFlashcardData } = useActiveStudent()
  const [audioQuizExamples, setAudioQuizExamples] = useState([])
  const [audioQuizReady, setAudioQuizReady] = useState(false)
  function filterExamplesByEnglishAudio(examples) {
    const newExampleTable = [...examples]
    const tableToSet = newExampleTable.filter((example) => {
      if (example.englishAudio.includes('.')) {
        return true
      }
      else {
        return false
      }
    })
    return tableToSet
  }

  useEffect(() => {
    if (audioExamplesTable.length > 0) {
      const filteredExamples = filterExamplesByEnglishAudio(audioExamplesTable)
      setAudioQuizExamples(filteredExamples)
    }
  }, [audioExamplesTable])

  useEffect(() => {
    if (audioQuizExamples.length > 0) {
      setAudioQuizReady(true)
    }
  }, [audioQuizExamples])

  return (
    <div>
      <h2 className="comprehensionHeader">Audio Quiz</h2>
      {audioQuizReady && (
        <AudioBasedReview
          activeStudent={activeStudent}
          // studentExamplesTable={studentFlashcardData.studentExamples}
          updateBannerMessage={updateBannerMessage}
          audioExamplesTable={audioQuizExamples}
          filterExamplesByAllowedVocab={filterExamplesByAllowedVocab}
          willAutoplay
          willStartWithSpanish={false}
          selectedLesson={selectedLesson}
          selectedProgram={selectedProgram}
          updateSelectedLesson={updateSelectedLesson}
          updateSelectedProgram={updateSelectedProgram}
        />
      )}
    </div>
  )
}
