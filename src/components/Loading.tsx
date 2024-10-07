import React from "react";
import wheelIcon from "../resources/Icon_Blue.svg";
import headIcon from "../resources/LearnCraft_Wheelless_Head_Blue.svg";

export default function LoadingMessage({ message }: { message: string }) {
  return (
    <div className="loading">
      <div className="loadingIcon">
        <img id="headIcon" src={headIcon} />
        <img id="wheelIcon" src={wheelIcon} />
      </div>
      <div className="loadingMessage">
        <h2>{message}</h2>
      </div>
    </div>
  );
}
