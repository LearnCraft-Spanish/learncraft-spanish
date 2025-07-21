import React from 'react';
import wheelIcon from '../../assets/Icon_Blue.svg';
import headIcon from '../../assets/LearnCraft_Wheelless_Head_Blue.svg';
import './Loading.scss';

export default function Loading({ message }: { message: string }) {
  return (
    <div className="loading">
      <div className="loadingIcon">
        <img id="headIcon" alt="loading-icon" src={headIcon} />
        <img id="wheelIcon" alt="loading-spinner" src={wheelIcon} />
      </div>
      <div className="loadingMessage">
        <h2>{message}</h2>
      </div>
    </div>
  );
}
