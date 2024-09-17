import React from 'react'

interface QuizProgressProps {
  currentExampleNumber: number
  totalExamplesNumber: number
  quizTitle: string
}

export default function NewQuizProgress({
  currentExampleNumber,
  totalExamplesNumber,
  quizTitle,
}: QuizProgressProps): JSX.Element {
  return (
    <div className="quizProgress">
      <h3>{quizTitle}</h3>
      <p>{`${currentExampleNumber}/${totalExamplesNumber}`}</p>
      <div className="newProgressBar">
        <div
          className="progressBarFill"
          style={{
            width: `${(currentExampleNumber / totalExamplesNumber) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
