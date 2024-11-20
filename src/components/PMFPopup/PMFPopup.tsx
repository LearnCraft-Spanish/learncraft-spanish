import React from 'react';
import './PMFPopup.css';
import closeIcon from '../../resources/icons/x.svg';

import { usePMFData } from '../../hooks/usePMFData';
import { useBackend } from '../../hooks/useBackend';

interface PMFPopupProps {
  timeToShowPopup: boolean;
}

export default function PMFPopup({
  timeToShowPopup,
}: PMFPopupProps): JSX.Element | false {
  const { canShowPMF, createOrUpdatePMFData } = usePMFData();
  const [closePopup, setClosePopup] = React.useState(false);

  function handlePopupClose() {
    setClosePopup(true);
    createOrUpdatePMFData();
  }
  function handleSubmit() {
    setClosePopup(true);
    // open google in a new tab
    window.open('https://google.com', '_blank');
    createOrUpdatePMFData();
  }

  return (
    !closePopup &&
    canShowPMF &&
    timeToShowPopup && (
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
