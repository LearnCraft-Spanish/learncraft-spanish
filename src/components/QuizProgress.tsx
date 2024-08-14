interface QuizProgressProps {
  currentExampleNumber: number
  totalExamplesNumber: number
}

export default function QuizProgress({
  currentExampleNumber,
  totalExamplesNumber,
}: QuizProgressProps): JSX.Element {
  return (
    <div className="progressBar">
      {`Flashcard ${currentExampleNumber} of ${totalExamplesNumber}`}
    </div>
  )
}
