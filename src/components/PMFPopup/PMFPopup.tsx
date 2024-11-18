import React from 'react';
import './PMFPopup.css';

interface PMFPopupProps {
  closePopup: () => void;
}

export default function PMFPopup({ closePopup }: PMFPopupProps): JSX.Element {
  return (
    <div className="popup">
      <div className="inner">
        <h1>Enjoying our software?</h1>
        <p>Answering our one question survey will help us improve!</p>
        <p>Go take the survey now?</p>
        <div className="buttonBox">
          <button type="button" onClick={closePopup}>
            Close
          </button>
          <button type="button">Go</button>
        </div>
      </div>
    </div>
  );
}
