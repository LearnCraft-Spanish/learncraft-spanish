import {
  LoginButton,
  LogoutButton,
} from '@interface/components/general/Buttons';

import React from 'react';
import { useNavigate } from 'react-router-dom';

import home from 'src/assets/icons/home.svg';
import logo from 'src/assets/typelogosmall.png';

export default function Nav(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    // Correct html tag is <nav> not <div>
    <div
      className={`div-header ${window.location.pathname === '/' ? ' ' : 'notRoot'}`}
    >
      <div
        className="homeButton"
        onClick={() => navigate('/')}
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
