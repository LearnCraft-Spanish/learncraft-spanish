import React from 'react';

interface QuizButtonsProps {
  decrementExample: () => void;
  incrementExample: () => void;
  firstExample: boolean;
  lastExample: boolean;
}

export default function QuizButtons({
  decrementExample,
  incrementExample,
  firstExample,
  lastExample,
}: QuizButtonsProps): JSX.Element {
  return (
    <div className="buttonBox">
      <button type="button" onClick={decrementExample} disabled={firstExample}>
        Previous
      </button>
      <button type="button" onClick={incrementExample} disabled={lastExample}>
        Next
      </button>
    </div>
  );
}
