import React from 'react';
import './quizzing.css';
interface QuizProgressProps {
  currentExampleNumber: number;
  totalExamplesNumber: number;
  quizTitle: string;
}

export default function QuizProgress({
  currentExampleNumber,
  totalExamplesNumber,
  quizTitle,
}: QuizProgressProps): React.JSX.Element {
  return (
    <div className="quizProgress">
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
  );
}
