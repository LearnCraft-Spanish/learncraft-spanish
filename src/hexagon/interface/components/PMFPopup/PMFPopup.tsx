import type { JSX } from 'react';
import { usePMFData } from '@application/useCases/usePMFData';
import { useState } from 'react';
import closeIcon from 'src/assets/icons/x_dark.svg';
import './PMFPopup.scss';

export interface PMFPopupProps {
  timeToShowPopup: boolean;
}

export default function PMFPopup({
  timeToShowPopup,
}: PMFPopupProps): JSX.Element | null {
  const { canShowPMF, createOrUpdatePMFData } = usePMFData();
  const [closePopup, setClosePopup] = useState(false);

  function handlePopupClose(): void {
    createOrUpdatePMFData({ hasTakenSurvey: false });
    setClosePopup(true);
  }

  function handleSubmit(): void {
    createOrUpdatePMFData({ hasTakenSurvey: true });
    setClosePopup(true);
    window.open('https://learncraft.typeform.com/to/kaI5Wwlx', '_blank');
  }

  if (closePopup || !canShowPMF || !timeToShowPopup) {
    return null;
  }

  return (
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
        <p>Answering a quick survey will help us improve!</p>
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
  );
}
