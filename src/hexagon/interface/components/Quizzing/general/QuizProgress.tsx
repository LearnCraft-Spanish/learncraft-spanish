import React from 'react';
import '@interface/components/Quizzing/general/QuizProgress.scss';
interface QuizProgressProps {
  quizTitle?: string;
  currentExampleNumber: number;
  totalExamplesNumber: number;
}

export function QuizProgress({
  quizTitle,
  currentExampleNumber,
  totalExamplesNumber,
}: QuizProgressProps): React.JSX.Element {
  return (
    <div className={`quizProgress ${!quizTitle ? 'noTitle' : ''}`}>
      {quizTitle && <h3>{quizTitle}</h3>}
      <p>{`${currentExampleNumber} of ${totalExamplesNumber}`}</p>
      <div className="progressBar">
        <div
          className="progressBarFill"
          style={{
            width: `${(currentExampleNumber / totalExamplesNumber) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
