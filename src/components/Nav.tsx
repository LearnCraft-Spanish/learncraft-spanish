import { useNavigate } from "react-router-dom";

import logo from "../resources/typelogosmall.png";
import home from "../resources/icons/home.svg";

import LoginButton from "./Buttons/LoginButton";
import LogoutButton from "./Buttons/LogoutButton";

export default function Nav(): JSX.Element {
  const navigate = useNavigate();
  return (
    // Correct html tag is <nav> not <div>
    <div
      className={`div-header ${window.location.pathname === "/" ? " " : "notRoot"}`}
    >
      <div
        className="homeButton"
        onClick={() => navigate("/")}
        aria-description="home navigation"
      >
        <img id="logo" src={logo} alt="Learncraft Spanish Logo" />
        <img src={home} alt="" id="homeIcon" />
      </div>
      <LogoutButton />
      <LoginButton />
    </div>
  );
}
