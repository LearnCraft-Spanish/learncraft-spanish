import React from 'react'

interface QuizProgressProps {
  currentExampleNumber: number
  totalExamplesNumber: number
  quizTitle: string
  unReadyQuiz: () => void
}

export default function NewQuizProgress({
  currentExampleNumber,
  totalExamplesNumber,
  quizTitle,
  unReadyQuiz,
}: QuizProgressProps): JSX.Element {
  return (
    <div className="quizProgress">
      <div
        className={`backButton ${window.location.pathname === '/' ? ' ' : 'notRoot'}`}
        onClick={() => unReadyQuiz()}
      >
        <i className="fa-solid fa-reply"></i>
      </div>
      <h3>{quizTitle}</h3>
      <p>{`${currentExampleNumber}/${totalExamplesNumber}`}</p>
      <div className="progressBar">
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
