export default function AudioFlashcardComponent({
  currentExampleText,
  incrementCurrentStep,
  autoplay,
  progressStatus,
  currentExample,
  incrementExample,
  decrementExample,
  examplesToPlay,
}: {
  currentExampleText: string | JSX.Element
  incrementCurrentStep: () => void
  autoplay: boolean
  progressStatus: number
  currentExample: number
  incrementExample: () => void
  decrementExample: () => void
  examplesToPlay: any[]
}) {
  return (
    <div className={!autoplay ? 'audioTextBox' : 'audioAutoplayFlashcardWrapper'}>
      <div
        className="audioExample"
        onClick={!autoplay ? () => incrementCurrentStep() : () => {}}
      >
        <h3>{currentExampleText}</h3>
        {/* added event.stopPropagation to prevent the click propgating down to parent, and triggering incrementCurrentStep */}
        <div className="navigateButtons">
          {currentExample > 0 && (
            <a
              className="previousButton"
              onClick={(event) => {
                event.stopPropagation()
                decrementExample()
              }}
            >
              {'<'}
            </a>
          )}
          {currentExample < examplesToPlay.length - 1 && (
            <a
              className="nextButton"
              onClick={(event) => {
                event.stopPropagation()
                incrementExample()
              }}
            >
              {'>'}
            </a>
          )}
        </div>
        {autoplay && (
          <div
            className="progressStatus"
            style={{ width: `${progressStatus * 100}%` }}
          />
        )}
      </div>
    </div>
  )
}
