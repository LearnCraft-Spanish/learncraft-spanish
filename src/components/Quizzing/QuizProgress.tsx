import React from 'react';
import './quizzing.css';
interface QuizProgressProps {
  currentExampleNumber: number;
  totalExamplesNumber: number;
}

export default function QuizProgress({
  currentExampleNumber,
  totalExamplesNumber,
}: QuizProgressProps): React.JSX.Element {
  return (
    <div className="quizProgress">
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
  );
}
