import './AudioBasedReview.css'

interface StepProgressBarProps {
  currentStep: string
  autoplay: boolean
}
export default function StepProgressBar({
  currentStep,
  autoplay,
}: StepProgressBarProps): JSX.Element {
  const steps = ['question', 'hint', 'answer']
  const stepsAutoplay = ['question', 'guess', 'hint', 'answer']
  return (
    <div className="stepProgressBar">
      {autoplay
        ? stepsAutoplay.map(step => (
          <div key={step} className={(stepsAutoplay.indexOf(step) <= stepsAutoplay.indexOf(currentStep)) ? 'stepVisual active' : 'stepVisual'} />
        ))
        : steps.map(step => (
          <div key={step} className={(stepsAutoplay.indexOf(step) <= stepsAutoplay.indexOf(currentStep)) ? 'stepVisual active' : 'stepVisual'} />
        ))}
    </div>
  )
}
