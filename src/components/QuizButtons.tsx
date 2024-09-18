import React from 'react'

interface QuizButtonsProps {
  decrementExample: () => void
  incrementExample: () => void
}

export default function QuizButtons({
  decrementExample,
  incrementExample,
}: QuizButtonsProps): JSX.Element {
  return (
    <div className="buttonBox">

      <button type="button" onClick={decrementExample}>
        Previous
      </button>
      <button type="button" onClick={incrementExample}>
        Next
      </button>

    </div>
  )
}
