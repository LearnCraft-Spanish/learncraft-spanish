import React from 'react';
import './PMFPopup.css';
import closeIcon from '../../resources/icons/x.svg';

import { usePMFData } from '../../hooks/usePMFData';

interface PMFPopupProps {
  showPopup: boolean;
}

export default function PMFPopup({
  showPopup,
}: PMFPopupProps): JSX.Element | false {
  const { canShowPMF, createPMFData } = usePMFData();

  function handlePopupClose() {
    createPMFData();
    console.log('Popup closed');
  }
  function handleSubmit() {
    createPMFData();
    console.log('Survey submitted!, data created');
  }
  return (
    canShowPMF &&
    showPopup && (
      <div className="popup">
        <div className="inner">
          <div className="iconWrapper">
            <img
              src={closeIcon}
              alt="close popup"
              className="icon"
              onClick={handlePopupClose}
            />
          </div>
          <h1>Enjoying our software?</h1>
          <p>Answering our one question survey will help us improve!</p>
          <p>Go take the survey now?</p>
          <div className="buttonBox">
            <button type="button" id="closeButton" onClick={handlePopupClose}>
              Close
            </button>
            <button type="button" onClick={handleSubmit}>
              Go
            </button>
          </div>
        </div>
      </div>
    )
  );
}
