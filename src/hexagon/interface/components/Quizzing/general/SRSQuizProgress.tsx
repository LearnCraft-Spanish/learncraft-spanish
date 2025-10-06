import React from 'react';
import './QuizProgress.scss';
interface SRSQuizProgressProps {
  quizTitle?: string;
  totalExamplesNumber: number;
}

export function SRSQuizProgress({
  quizTitle,
  totalExamplesNumber,
}: SRSQuizProgressProps): React.JSX.Element {
  return (
    <div className="quizProgress">
      {quizTitle && <h3>{quizTitle}</h3>}
      <p>{`${totalExamplesNumber} Flashcards Remaining`}</p>
    </div>
  );
}
