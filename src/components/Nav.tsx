import { useNavigate } from "react-router-dom";

import logo from "../resources/typelogosmall.png";

import LoginButton from "./Buttons/LoginButton";
import LogoutButton from "./Buttons/LogoutButton";

export default function Nav(): JSX.Element {
  const navigate = useNavigate();
  return (
    // Correct html tag is <nav> not <div>
    <div
      className={`div-header ${window.location.pathname === "/" ? " " : "notRoot"}`}
    >
      <div className="homeButton" onClick={() => navigate("/")}>
        <img id="logo" src={logo} alt="Learncraft Spanish Logo" />
        <i id="homeIcon" className="fa-solid fa-home"></i>
      </div>
      <LogoutButton />
      <LoginButton />
    </div>
  );
}
