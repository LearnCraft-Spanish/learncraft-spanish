import type { JSX } from 'react';
import {
  LoginButton,
  LogoutButton,
} from '@interface/components/general/Buttons';
import { Link, useLocation } from 'react-router-dom';

import home from 'src/assets/icons/home.svg';
import logo from 'src/assets/typelogosmall.png';

/**
 * Legacy top bar. `App` mounts this for logged-out visitors and every v1
 * session; v2 (beta-tester students) get `AppHeader` instead.
 */
export default function Nav(): JSX.Element {
  const { pathname } = useLocation();
  return (
    <div className={`div-header ${pathname === '/' ? ' ' : 'notRoot'}`}>
      <Link to="/" className="homeButton" aria-description="home navigation">
        <img id="logo" src={logo} alt="Learncraft Spanish Logo" />
        <img src={home} alt="" id="homeIcon" />
      </Link>
      <LogoutButton />
      <LoginButton />
    </div>
  );
}
